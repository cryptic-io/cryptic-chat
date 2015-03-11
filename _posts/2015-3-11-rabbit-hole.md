---
layout: post
title: Rabbit Hole
tags: debug php sysdig dns
username: mediocregopher
---

# Rabbit Hole

We've begun rolling out [SkyDNS][skydns] at my job, which has been pretty neat.
We're basing a couple future projects around being able to use it, and it's made
dynamic configuration and service discovery nice and easy.

This post chronicles catching a bug because of our switch to SkyDNS, and how we
discover its root cause. I like to call these kinds of bugs "rabbit holes"; they
look shallow at first, but anytime you make a little progress forward a little
more is always required, until you discover the ending somewhere totally
unrelated to the start.

## The Bug

We are seeing *tons* of these in the SkyDNS log:

```
[skydns] Feb 20 17:21:15.168 INFO      | no nameservers defined or name too short, can not forward
```

I fire up tcpdump to see if I can see anything interesting, and sure enough run
across a bunch of these:

```
# tcpdump -vvv -s 0 -l -n port 53
tcpdump: listening on eth0, link-type EN10MB (Ethernet), capture size 65535 bytes
    ...
    $fen_ip.50257 > $skydns_ip.domain: [udp sum ok] 16218+ A? unknown. (25)
    $fen_ip.27372 > $skydns_ip.domain: [udp sum ok] 16218+ A? unknown. (25)
    $fen_ip.35634 > $skydns_ip.domain: [udp sum ok] 59227+ A? unknown. (25)
    $fen_ip.64363 > $skydns_ip.domain: [udp sum ok] 59227+ A? unknown. (25)
```

It appears that some of our front end nodes (FENs) are making tons of DNS
fequests trying to find the A record of `unknown`. Something on our FENs is
doing something insane and is breaking.

## The FENs

Hopping over to my favorite FEN we're able to see the packets in question
leaving on a tcpdump as well, but that's not helpful for finding the root cause.
We have lots of processes running on the FENs and any number of them could be
doing something crazy.

We fire up sysdig, which is similar to systemtap and strace in that it allows
you to hook into the kernel and view various kernel activites in real time, but
it's easier to use than both. The following command dumps all UDP packets being
sent and what process is sending them:

```
# sysdig fd.l4proto=udp
...
2528950 22:17:35.260606188 0 php-fpm (21477) < connect res=0 tuple=$fen_ip:61173->$skydns_ip:53
2528961 22:17:35.260611327 0 php-fpm (21477) > sendto fd=102(<4u>$fen_ip:61173->$skydns_ip:53) size=25 tuple=NULL
2528991 22:17:35.260631917 0 php-fpm (21477) < sendto res=25 data=.r...........unknown.....
2530470 22:17:35.261879032 0 php-fpm (21477) > ioctl fd=102(<4u>$fen_ip:61173->$skydns_ip:53) request=541B argument=7FFF82DC8728
2530472 22:17:35.261880574 0 php-fpm (21477) < ioctl res=0
2530474 22:17:35.261881226 0 php-fpm (21477) > recvfrom fd=102(<4u>$fen_ip:61173->$skydns_ip:53) size=1024
2530476 22:17:35.261883424 0 php-fpm (21477) < recvfrom res=25 data=.r...........unknown..... tuple=$skydns_ip:53->$fen_ip:61173
2530485 22:17:35.261888997 0 php-fpm (21477) > close fd=102(<4u>$fen_ip:61173->$skydns_ip:53)
2530488 22:17:35.261892626 0 php-fpm (21477) < close res=0
```

Aha! We can see php-fpm is requesting something over udp with the string
`unknown` in it. We've now narrowed down the guilty process, the rest should be
easy right?

## Which PHP?

Unfortunately we're a PHP shop; knowing that php-fpm is doing something on a FEN
narrows down the guilty codebase little. Taking the FEN out of our load-balancer
stops the requests for `unknown`, so we *can* say that it's some user-facing
code that is the culprit. Our setup on the FENs involves users hitting nginx
for static content and nginx proxying PHP requests back to php-fpm. Since all
our virtual domains are defined in nginx, we are able to do something horrible.

On the particular FEN we're on we make a guess about which virtual domain the
problem is likely coming from (our main app), and proxy all traffic from all
other domains to a different FEN. We still see requests for `unknown` leaving
the box, so we've narrowed the problem down a little more.

## The Despair

Nothing in our code is doing any direct DNS calls as far as we can find, and we
don't see any places PHP might be doing it for us. We have lots of PHP
extensions in place, all written in C and all black boxes; any of them could be
the culprit. Grepping through the likely candidates' source code for the string
`unknown` proves fruitless.

We try xdebug at this point. xdebug is a profiler for php which will create
cachegrind files for the running code. With cachegrind you can see every
function which was ever called, how long spent within each function, a full
call-graph, and lots more. Unfortunately xdebug outputs cachegrind files on a
per-php-fpm-process basis, and overwrites the previous file on each new request.
So xdebug is pretty much useless, since what is in the cachegrind file isn't
necessarily what spawned the DNS request.

## Gotcha (sorta)

We turn back to the tried and true method of dumping all the traffic using
tcpdump and perusing through that manually.

What we find is that nearly everytime there is a DNS request for `unknown`, if
we scroll up a bit there is (usually) a particular request to memcache. The
requested key is always in the style of `function-name:someid:otherstuff`. When
looking in the code around that function name we find this ominous looking call:

```php
$ipAddress = getIPAddress();
$geoipInfo = getCountryInfoFromIP($ipAddress);
```

This points us in the right direction. On a hunch we add some debug
logging to print out the `$ipAddress` variable, and sure enough it comes back as
`unknown`. AHA!

So what we surmise is happening is that for some reason our geoip extension,
which we use to get the location data of an IP address and which
`getCountryInfoFromIP` calls, is seeing something which is *not* an IP address
and trying to resolve it.

## Gotcha (for real)

So the question becomes: why are we getting the string `unknown` as an IP
address?

Adding some debug logging around the area we find before showed that
`$_SERVER['REMOTE_ADDR']`, which is the variable populated with the IP address
of the client, is sometimes `unknown`. We guess that this has something to do
with some magic we are doing on nginx's side to populate `REMOTE_ADDR` with the
real IP address of the client in the case of them going through a proxy.

Many proxies send along the header `X-Forwarded-For` to indicate the real IP of
the client they're proxying for, otherwise the server would only see the proxy's
IP. In our setup I decided that in those cases we should set the `REMOTE_ADDR`
to the real client IP so our application logic doesn't even have to worry about
it. There are a couple problems with this which render it a bad decision, one
being that if some misbahaving proxy was to, say, start sending
`X-Forwarded-For: unknown` then some written applications might mistake that to
mean the client's IP is `unknown`.

## The Fix

The fix here was two-fold:

1) We now always set `$_SERVER['REMOTE_ADDR']` to be the remote address of the
requests, regardless of if it's a proxy, and also send the application the
`X-Forwarded-For` header to do with as it pleases.

2) Inside our app we look at all the headers sent and do some processing to
decide what the actual client IP is. PHP can handle a lot more complex logic
than nginx can, so we can do things like check to make sure the IP is an IP, and
also that it's not some NAT'd internal ip, and so forth.

And that's it. From some weird log messages on our DNS servers to an nginx
mis-configuration on an almost unrelated set of servers, this is one of those
strange bugs that never has a nice solution and goes unsolved for a long time.
Spending the time to dive down the rabbit hole and find the answer is often
tedious, but also often very rewarding.

[skydns]: https://github.com/skynetservices/skydns
