---
layout: post
title: Dual-Boot Cloudready and Linux Mint
tags: linux-mint cloudready dual-boot grub
username: likethemammal
---

![Cloudready Logo](https://p5.zdassets.com/hc/settings_assets/187734/200050403/SZGZzvDCxuqvTTwMdcXTrw-Screen_Shot_2015-09-18_at_9.30.01_AM.png)

<center>*Source: Neverware*</center>

## Prologue

My girlfriend has been on an HP Chromebook 14 for a while now. I was originally the one to recommend it and she's been generally satisfied except for a few issues. One is that, even though there are many web based alternatives to common software, the Chromebook *hardware* isn't actually capable of running them for very long. Audio editing, flash gaming, and sometimes even regular usage cause scrolling, typing, and the like, to slug to a stutter.

For a while I've wanted to setup one of my old machines for her to use. The machine would have to be as easy to use as Chrome OS, but capable of running traditional PC games and audio editing software (she's a musician).

As I detailed in [my last post](https://cryptic.io/linux-mint-razer-blade/), I recently got a Razer Blade gaming laptop setup as my personal machine. That freed up the laptop I had been using previously, an HP Probook 430 G1, to become hers. To make the transition to this new machine easier, I felt that I should provide her the option to use Chrome OS which she's accustom to and Linux Mint, which would give her access to the traditional software she'd need for anything more than basic computing.

This post documents the process of setting up Cloudready (Chrome OS) and Linux Mint to dual boot on the same machine.


##### What is Cloudready

If you haven't heard of [Cloudready](http://www.neverware.com/), it is software Neverware provides to easily install [Chromium OS](https://www.chromium.org/chromium-os) (the open-source version of Chrome OS) onto Windows machines.  Cloudready also handles automatically updating the OS, a feature not included normally in Chromium OS.

Neverware's focus is on revamping schools' old computer labs. Since a lot of that hardware is still better than today's Chromebooks, it runs Chromium beautifully. They also have a setup process to preserve the current Windows install and "dual boot" that with Cloudready.

I use quotes around "dual-boot" because, when running the dual-boot setup, Cloudready is actually installed **into** the Windows partition, instead of along side it, completely taking it over. Its own boot software then manages whether it boots the user's Windows install or Chromium.

I've provided diagrams below to explain the difference between this and a traditional dual-boot setup. We're aiming for a traditional dual-boot setup with Cloudready and Linux Mint in parallel. We may even try for the triple-boot!


![Linux Mint and Cloudready boot structures](/imgs/article/mint-cloudready-boot-diagram.png)

<center>*Source: Me, diagram baller*</center>

## Chapter 1: Pre-install

##### Get Cloudready bootable usb

To "dual-boot" like this, the [Cloudready docs say](http://www.neverware.com/installation) you'll need 32GB of free space in the current Windows partition for Cloudready to use.

Since my machine was already running Windows 7, I thought I'd try for a triple-boot. I first booted into the current Windows install to make sure I cleaned out all my old stuff off before starting anything.

Within a few minutes Windows had already pissed me off, and I resolved that my gf wouldn't want to deal with Windows anyways. Consequently, I went with the Cloudready standalone install, also resolving to wipe everything from the machine and then install Mint after that.

So, with that in mind, follow the instructions [here](http://www.neverware.com/installation#quickinstallprocess) for getting the standalone version of Cloudready bootable from a usb stick that's at least 16GB.


##### Get Linux Mint bootable usb

Personally, I only had one usb stick available, but ideally you'd have another to put Mint on. I'll cover this later, but after the Cloudready install, this usb stick can be wiped and used for the Mint install.

When ready, follow these [instructions to boot Mint from a usb](https://community.linuxmint.com/tutorial/view/744).


##### Setting up the BIOS

Throughout the setup process you may come across a few recommended changes to the BIOS to get everything working. Might as well do these now. This HP machine has its own HP version of the BIOS, so some things may be specific to HP. I tried to keep things as general as possible, but the [Archlinux wiki](https://wiki.archlinux.org/index.php/GRUB/EFI_examples) has detailed info for setting the UEFI mode for any BIOS.

Start up the machine. Press the required key to get into the BIOS menus.

 * Change the Boot Mode to: UEFI Hybrid mode
 * Turn off Fast Boot, Secure Boot, and/or the like.

That's it for now, we'll be back in this menu again before everything's said and done.

Plug in the bootable usb stick, restart the machine, and boot from usb.

## Chapter 2: Installing Cloudready

After booting from usb, Cloudready's logo should appear, and the OS should start feeling like Chrome.

Follow the directions in [the docs](http://www.neverware.com/installation#installprocess) for a standalone installation. They're pretty straight-forward. If your boot options are setup right Cloudready should be installed after cycling through a few menus.

![Cloudready taskbar](http://static1.squarespace.com/static/541b8bbee4b09b50ed999338/t/56b8fcfb746fb9e9990ecec6/1454963968683/?format=300w)

After install, restart the comp. When you've booted back in, make sure "Install Cloudready..." **isn't** at the top of the taskbar.

Cloudready is now installed!

Unfortunately, as of this writing, several media streaming sites don't work out of the box. Neverware knows of this issue and has come up with a [temp solution using chrome extensions](https://neverware.zendesk.com/hc/en-us/articles/214608478-Enable-Netflix-and-Other-Protected-Content-on-v45-and-above-). Basically tricking Netflix and other sites into thinking you're running something other than Chromium OS.

## Chapter 3: Installing Linux Mint

Now you'll need a bootable Linux Mint usb stick. If you only have the one usb stick, you can now wipe Cloudready off it, and follow [the instructions](https://community.linuxmint.com/tutorial/view/744) to get Mint on there.

Restart the comp. USB boot the Linux Mint stick. Start the normal Mint install process.


##### Partioning space for Mint

Select "Something else" from the partition prompt. Now we can actually see what Cloudready has done to the drive.

As the picture below depicts, Cloudready has made several partitions beyond just the original Windows partition.


![Linux Mint partition menu after Cloudready](/imgs/article/mint-cloudready-boot-menu-1.png)

![Linux Mint partition menu after Cloudready 2](/imgs/article/mint-cloudready-boot-menu-2.png)


Select that last partition (/dev/sda16 in this picture) and remove as much space as needed. For reference, it seems that the Cloudready OS is around 9GB. I left that partition around 40GB. 10 for the OS and 30 for it to use as file space.

Once space has been freed up, create a partition for Mint and set a mount point for it. Add some swap space, about 2 or 3 gigs should be fine, and follow the rest of the install instructions.

When you reboot don't be disappointed when it still boots into Cloudready.

## Chapter 4: Setting up Grub

##### What is Grub, why use it?

Cloudready works by taking over as the default OS boot manager, so it's tricky to boot into Mint at this point. It's doable by booting using an `efi` file, but that's not something I'd expect my GF to do.

[Grub](https://help.ubuntu.com/community/Grub2) is the boot manager that comes pre-installed with Ubuntu, therefore it should have already been installed with Mint. Since the default OS boot manager is in front of our Mint install, we aren't able to actually access Grub though. We gotta setup Grub (or any boot manager) so it appears in the boot order in front of the OS boot manager.


##### How the boot currently works

Earlier we setup the BIOS to boot using UEFI mode. The UEFI boot process is directed to the path of an `efi` file, which gives it direction on how to boot. For my machine the default boot files were `/efi/boot/bootx64.efi` (for 64-bit) and `/efi/boot/bootia32.efi` (for 32 bit).

The **efi** file to boot into Grub is located at `/efi/Ubuntu/grubx64.efi`. A quick and dirty way to setup Grub would be to just replace the default boot file with a copy of the Grub efi file. But there's a few issues with this method.

1. Because it'd be hard coded, any changes made to the` grubx64.efi` would have to be manually copied every time.
2. If Grub exits for some reason, it will exit into the default OS boot process, which would be Grub again. I'd rather it exit into the default boot file Cloudready has control of. Cloudready will probably be the main OS used on this machine, so I prefer this fallback.

Luckily, we can set things up to boot from a custom file before trying to boot from the default `bootx64` file.


##### Setting up a Customized Boot

In the BIOS a **Customized Boot** can be made. Basically setting the path to whatever custom efi you want. In the HP BIOS there's just an option for this, set to the path of the desired efi file, so restart and jump into the BIOS.

All were going to do is point this Customized Boot option at the Grub efi file. After that's set be sure to change the **UEFI boot order** so that Customized Boot is first and OS boot manager is second.

Sweet! We have Grub setup and life is back to normal. After saving your changes, reboot and check out your handy work.


## Chapter 5: Cleaning things up

You should now be able to easily switch between Mint and Cloudready on startup. At this point, depending on your setup you probably have a bunch of ugly menu options clogging up the Grub menu and causing confusion. We'll clean those up in a bit.


##### Fixing the WiFi

Boot into Mint. If you're like me, the WiFi isn't working yet. For some reason, with the base install, the WiFi drivers were disabled.

Plug into an Ethernet and open up Driver Manager.

Switch to the recommended WiFi drivers, or whichever ones you want, and reboot back into Mint. Now we'll cleanup Grub.


##### Cleaning up Grub

From Linux, there's several ways to change the Grub menu order and naming. Because this boot setup is a bit out of the ordinary, and we're using Grub from inside the Ubuntu OS it's a little tricky to set things up from the terminal.

[Grub Customizer](https://launchpad.net/grub-customizer) does exactly what we want without much fuss. Follow [this link](https://launchpad.net/~danielrichter2007/+archive/grub-customizer) to easily install from the package manager. Open it up, and we'll start cleaning things up.

I tested a few of these efi files to see which ones I should keep in the menu. Most were irrelevant to me so I "removed" them. I renamed `/etc/boot/bootx64` to Cloudready, so it'd be recognizable. And I changed the order so it'd be first in the menu.

Save your changes, restart, and soak in the clean.


## Epilogue

And that's it. We'll end on that warm fuzzy feeling. Grub should be one of the first menus you see on start, and Cloudready should work, blissfully ignorant to the dual boot setup.

Leave your comments in the section below. Let me know if you came across a fix I didn't mention.