---
layout: post
title: Running Linux Mint on a Razer Blade
tags: linux mint razer-blade setup
username: likethemammal
---

![Linux Mint logo](https://upload.wikimedia.org/wikipedia/commons/5/5c/Linux_Mint_Official_Logo.svg)

**tl;dr** The <a  href="http://www.amazon.com/gp/product/B01AGINE7Q/ref=as_li_tl?ie=UTF8&camp=1789&creative=9325&creativeASIN=B01AGINE7Q&linkCode=as2&tag=likethemammal-20&linkId=VLVDTKUEZSESNTID">Razer Blade 2015</a><img class="amazon-referral-link" src="http://ir-na.amazon-adsystem.com/e/ir?t=likethemammal-20&l=as2&o=1&a=B01AGINE7Q" width="1" height="1" border="0" alt="" style="border:none !important; margin:0px !important;" /> is a great portable gaming workstation. After months of research, tweaking, and ironing out the kinks, I've found that Linux Mint runs beautifully. The only problem still unresolved is an issue with the internal webcam.

### Prologue
I've been looking for a portable gaming PC for a while. Last year, [Lifehacker's review of the 2015 Razer Blade Full HD](http://gizmodo.com/razer-blade-2015-review-finally-living-the-thin-gaming-1689073179) convinced me that was the machine I've been waiting for.

A few months back Razer finally put that model up <a  href="http://www.amazon.com/gp/product/B01AGINE7Q/ref=as_li_tl?ie=UTF8&camp=1789&creative=9325&creativeASIN=B01AGINE7Q&linkCode=as2&tag=likethemammal-20&linkId=VLVDTKUEZSESNTID">on Amazon</a><img src="http://ir-na.amazon-adsystem.com/e/ir?t=likethemammal-20&l=as2&o=1&a=B01AGINE7Q" width="1" height="1" border="0" alt="" style="border:none !important; margin:0px !important;" />, at a discount. With the power of a credit card, I finally had the mini gaming workstation of my dreams in hand!

I've done 3 or 4 full builds of Linux before, all with Mint. One on a Chromebook, but mostly on machines with slightly dated hardware. This build has by far been the hardest, and I learned the hard way that Linux isn't as stable on "new" hardware.

### Chapter 1: Pre-install

##### Expand SSD storage (optional)

The SSD in the Full HD edition is about 250 GB. If you're like me and want to dual-boot, this doesn't leave much space to split. If you're going to replace the ssd with a larger one, now's the time to do it. Here's a video on how:

<iframe width="560" height="315" src="https://www.youtube.com/embed/xjM-ByOE0fQ" frameborder="0" allowfullscreen></iframe>

##### Prepare your SSD (optional)

There's loads of stuff that can be done to reduce the wear on a SSD. Several things on [this list](https://sites.google.com/site/easylinuxtipsproject/ssd) can, and should, only be done before install. It's something to consider.

##### Get a bootable USB drive

Get the download for Mint from the [downloads page](https://www.linuxmint.com/download.php), I **highly recommend** you choose the Mate version over Cinnamon. Mint and Cinnamon are the window managers that come bundled with their respective version of the Mint download. This choice will come into play later. Although, if you choose Cinnamon and run into problems, there are ways to switch after the fact.

Open up the Linux Mint [User Guide](https://www.linuxmint.com/documentation.php) and follow the instructions  under the "Check the MD5" section of the guide for verifying the Linux Mint download. You'll also want this open for details on most of the initial setup process. This post only covers steps beyond the guide.

Use [this tutorial](https://community.linuxmint.com/tutorial/view/744) to mount the downloaded `.iso` to a USB drive that's at least 2GB.

### Chapter 2: Install
Plug the Razer Blade into a power source. Follow the directions in the user guide to boot from USB and start the install process.

If you end up on the partition menu to customize the size of the install, make sure to add a few GB partition as "swap area". Among other things, this is important for resuming from a suspend. Learned this the hard way.

Follow the rest of the directions to install completely and remove the USB drive (it'll prompt you).

After install, boot up the machine, sign in, and install any updates from the Update Manager.

### Chapter 3: Fixing hardware issues
There are several parts of the hardware that just aren't hooked up right with the base install. I ran into issues with suspend black-screening indefinitely, two-finger scroll not working and other touchpad issues, and the internal webcam not working.

The only concrete and consistent fix I've found is to change the version of the Linux kernel being used to one of the more recent versions. This is a critical part of the system, so use caution, but I was able to fix most of my hardware issues this way.

##### Changing the kernel

Using the same Update Manager, navigate to View > Linux Kernels. This menu shows the full list of kernels available to switch to. As of this writing, the recommended and default kernel for Mint is **3.19.0-32**. I tried several different versions, some fixing some issues and creating others. The version I found most stable is **4.2.0-18**, and that's what I landed on.

Load up 4.2.0-18 and then restart the machine. Mint should automatically boot into the latest version.

This should fix the touchpad and suspend issues. The internal webcam issue still haunts me. I've worked around it by booting into Windows (works fine there) or using an external one. There are [several](https://insider.razerzone.com/index.php?threads/linux-on-a-new-blade.4115/page-4) [threads](https://bugs.launchpad.net/ubuntu/+source/cheese/+bug/1295247) that have mentioned this as a common issue.

### Chapter 4: Fixing software issues
As I'll touch on in the last chapter, battery length was a bit disappointing at first. With Cinnamon, by default I was barely getting 1.5 hours of battery life with general usage (internet browsing, videos, code editor)! Maybe 2.5 using Windows. At first this felt like a deal breaker, until I fixed the issues actually causing the power drain. Now I can get around 3.5 - 4. Which, in my opinion, is decent for a laptop gaming rig.

##### Switching to Nvidia drivers

At some point, it may be explicitly beneficial for you to switch to the Nvidia video card drivers over the default open-source X.Org drivers. Switching will also provide more fine grain control over the video card and provides the ability to switch between Performance settings and Power Saving settings.

Mint comes installed with Driver Manager. Open that up. There should only be the one set of video driver options. The OS recommends switching to the `nvidia-352` drivers but I went with `nvidia-352-updates` just to get the latest fixes.

Apply the changes and restart when it prompts.

##### Switching from Cinnamon

I made the mistake of installing the Cinnamon version of Mint, which led to some problems. Cinnamon, just like Mate, is a display manager for the OS. It's a bit cleaner and chicer than Mate, but I ran into **huge** performance issues with Cinnamon. This screenshot below depicts the issue.

![System Monitor, high cpu](http://i.imgur.com/aDXBPoQ.png)

CPU usage would start oscillating randomly. I noticed because, without any high-demand programs running, scrolling and typing would start lagging. Every time it happened I opened up the System Monitor and found this same pattern. The process that was causing this CPU fluctuation was Cinnamon. I tried a myriad of commands, tweaks, and tricks to try to fix the issue, but was never successful. I ended up switching to Mate, which resolved these issues completely.

Switching to Mate isn't hard. Following [a tutorial like this](http://winaero.com/blog/how-to-install-mate-in-linux-mint-cinnamon-edition/) should do the trick. After installing Mate, remember to set it as your default by opening up Login Window > Options > Default session.

Doing this also ended up giving me an hour or so of battery life back, so I highly recommend it.

### Chapter 5: Power savers
The rest are just tips for getting the most out of the battery.

##### Set the autostart brightness

By default the brightness of the screen is all the way up. I rarely want it that high, so I set the autostart brightness to about 40%. That way I don't have to remember to lower it everytime. [This answer](http://askubuntu.com/a/151665) explains how-to (the comments explain how to find your brightness levels).

##### Consider disabling bluetooth

Keeping bluetooth running all the time chews up battery life, just like it does on your phone. There are [several ways](https://community.linuxmint.com/tutorial/view/1102) to disable bluetooth in Linux Mint.

### Epilogue
That's it. After months of tweaking, and 3 re-builds of the same machine I've come out happy with my Razer Blade. As I mentioned, my only issue left is the internal webcam. Hopefully, as the hardware becomes more supported, the kernels will fix this issue.

Fix something I didn't mention, or have a question? Leave your comments in the section below.
