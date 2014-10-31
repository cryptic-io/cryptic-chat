---
layout: post
title: Erlang Pitfalls
tags: erlang
username: mediocregopher
---

# Erlang Pitfalls

I've been involved with a large-ish scale erlang project at Grooveshark since
sometime around 2011. I started this project knowing absolutely nothing about
erlang, but now I feel I have accumulated enough knowlege over time that I could
conceivably give some back. Specifically, common pitfalls that people may run
into when designing and writing a large-scale erlang application. Some of these
may show up when searching for them, but some of them you may not even know you
need to search for.

## now() vs timestamp()

The cononical way of getting the current timestamp in erlang is to use
`erlang:now()`. This works great at small loads, but if you find your
application slowing down greatly at highly parallel loads and you're calling
`erlang:now()` a lot, it may be the culprit.

A property of this method you may not realize is that it is monotonically
increasing, meaning even if two processes call it at the *exact* same time they
will both receive different output. This is done through some locking on the
low-level, as well as a bit of math to balance out the time getting out of sync
in the scenario.

There are situations where fetching always unique timestamps is useful, such as
seeding RNGs and generating unique identifiers for things, but usually when
people fetch a timestamp they just want a timestamp. For these cases,
`os:timestamp()` can be used. It is not blocked by any locks, it simply returns
the time.

## The rpc module is slow

The built-in `rpc` module is slower than you'd think. This mostly stems from it
doing a lot of extra work for every `call` and `cast` that you do, ensuring that
certain conditions are accounted for. If, however, it's sufficient for the
calling side to know that a call timed-out on them and not worry about it any
further you may benefit from simply writing your own rpc module. Alternatively,
use [one which already exists](https://github.com/cloudant/rexi).

## Don't send anonymous functions between nodes

One of erlang's niceties is transparent message sending between two phsyical
erlang nodes. Once nodes are connected, a process on one can send any message to
a process on the other exactly as if they existed on the same node. This is fine
for many data-types, but for anonymous functions it should be avoided.

For example:

```erlang
RemotePid ! {fn, fun(I) -> I + 1 end}.
```

Would be better written as

```erlang
incr(I) ->
    I + 1.

RemotePid ! {fn, ?MODULE, incr}.
```

and then using an `apply` on the RemotePid to actually execute the function.

This is because hot-swapping code messes with anonymous functions quite a bit.
Erlang isn't actually sending a function definition across the wire; it's simply
sending a reference to a function. If you've changed the code within the
anonymous function on a node, that reference changes. The sending node is
sending a reference to a function which may not exist anymore on the receiving
node, and you'll get a weird error which Google doesn't return many results for.

Alternatively, if you simply send atoms across the wire and use `apply` on the
other side, only atoms are sent and the two nodes involved can have totally
different ideas of what the function itself does without any problems.

## Hot-swapping code is a convenience, not a crutch

Hot swapping code is the bees-knees. It lets you not have to worry about
rolling-restarts for trivial code changes, and so adds stability to your
cluster. My warning is that you should not rely on it. If your cluster can't
survive a node being restarted for a code change, then it can't survive if that
node fails completely, or fails and comes back up. Design your system pretending
that hot-swapping does not exist, and only once you've done that allow yourself
to use it.

## GC sometimes needs a boost

Erlang garbage collection (GC) acts on a per-erlang-process basis, meaning that
each process decides on its own to garbage collect itself. This is nice because
it means stop-the-world isn't a problem, but it does have some interesting
effects.

We had a problem with our node memory graphs looking like an upwards facing
line, instead of a nice sinusoid relative to the number of connections during
the day. We couldn't find a memory leak *anywhere*, and so started profiling. We
found that the memory seemed to be comprised of mostly binary data in process
heaps. On a hunch my coworker Mike Cugini (who gets all the credit for this) ran
the following on a node:

```erlang
lists:foreach(erlang:garbage_collect/1, erlang:processes()).
```

and saw memory drop in a huge way. We made that code run every 10 minutes or so
and suddenly our memory problem went away.

The problem is that we had a lot of processes which individually didn't have
much heap data, but all-together were crushing the box. Each didn't think it had
enough to garbage collect very often, so memory just kept going up. Calling the
above forces all processes to garbage collect, and thus throw away all those
little binary bits they were hoarding.

## These aren't the solutions you are looking for

The `erl` process has tons of command-line options which allow you to tweak all
kinds of knobs. We've had tons of performance problems with our application, as
of yet not a single one has been solved with turning one of these knobs. They've
all been design issues or just run-of-the-mill bugs. I'm not saying the knobs
are *never* useful, but I haven't seen it yet.

## Erlang processes are great, except when they're not

The erlang model of allowing processes to manage global state works really well
in many cases. Possibly even most cases. There are, however, times when it
becomes a performance problem. This became apparent in the project I was working
on for Grooveshark, which was, at its heart, a pubsub server.

The architecture was very simple: each channel was managed by a process, client
connection processes subscribed to that channel and received publishes from it.
Easy right? The problem was that extremely high volume channels were simply not
able to keep up with the load. The channel process could do certain things very
fast, but there were some operations which simply took time and slowed
everything down. For example, channels could have arbitrary properties set on
them by their owners. Retrieving an arbitrary property from a channel was a
fairly fast operation: client `call`s the channel process, channel process
immediately responds with the property value. No blocking involved.

But as soon as there was any kind of call which required the channel process to
talk to yet *another* process (unfortunately necessary), things got hairy. On
high volume channels publishes/gets/set operations would get massively backed up
in the message queue while the process was blocked on another process. We tried
many things, but ultimately gave up on the process-per-channel approach.

We instead decided on keeping *all* channel state in a transactional database.
When client processes "called" operations on a channel, they really are just
acting on the database data inline, no message passing involved. This means that
read-only operations are super-fast because there is minimal blocking, and if
some random other process is being slow it only affects the one client making
the call which is causing it to be slow, and not holding up a whole host of
other clients.

## Mnesia might not be what you want

This one is probably a bit controversial, and definitely subject to use-cases.
Do your own testing and profiling, find out what's right for you.

Mnesia is erlang's solution for global state. It's an in-memory transactional
database which can scale to N nodes and persist to disk. It is hosted
directly in the erlang processes memory so you interact with it in erlang
directly in your code; no calling out to database drivers and such. Sounds great
right?

Unfortunately mnesia is not a very full-featured database. It is essentially a
key-value store which can hold arbitrary erlang data-types, albeit in a set
schema which you lay out for it during startup. This means that more complex
types like sorted sets and hash maps (although this was addressed with the
introduction of the map data-type in R17) are difficult to work with within
mnesia. Additionally, erlang's data model of immutability, while awesome
usually, can bite you here because it's difficult (impossible?) to pull out
chunks of data within a record without accessing the whole record.

For example, when retrieving the list of processes subscribed to a channel our
application doesn't simply pull the full list and iterate over it. This is too
slow, and in some cases the subscriber list was so large it wasn't actually
feasible. The channel process wasn't cleaning up its heap fast enough, so
multiple publishes would end up with multiple copies of the giant list in
memory. This became a problem. Instead we chain spawned processes, each of which
pull a set chunk of the subsciber list, and iterate over that. This is very
difficult to implement in mnesia without pulling the full subscriber list into
the process' memory at some point in the process.

It is, however, fairly trivial to implement in redis using sorted sets. For this
case, and many other cases after, the motto for performance improvements became
"stick it in redis". The application is at the point where *all* state which
isn't directly tied to a specific connection is kept in redis, encoded using
`term_to_binary`. The performance hit of going to an outside process for data
was actually much less than we'd originally thought, and ended up being a plus
since we had much more freedom to do interesting hacks to speedup up our
accesses.
