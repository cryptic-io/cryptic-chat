---
layout: post
title: Protip - Bash Sleep
tags: bash protip
username: mediocregopher
---

This is a short post, but something I didn't realize. `sleep` is a bash utility
which will sleep for a given number of seconds and then return. For example,
`sleep 1000` will sleep for 1000 seconds.

I discovered today `sleep` will also take in formatted intervals. For example,
`sleep 1m` will sleep for one minute, `sleep 2h` will sleep for 2 hours, etc...

So if you're tired of multiplying numbers by 60 in your head, you can rest easy
now.

Reference: [sleep man page](http://linux.die.net/man/1/sleep)
