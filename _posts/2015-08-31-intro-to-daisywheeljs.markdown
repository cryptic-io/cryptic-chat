---
layout: post
title: Adding the DaisywheelJS onscreen-keyboard to HTML5 Gamepad projects
tags: daisywheeljs daisywheel gamepad html5
source: https://github.com/likethemammal/daisywheeljs
demo: http://daisywheeljs.org
username: likethemammal
---

### Some background

HTML5 gaming has developed quite a bit since it first landed on the scene a few years back. Now, with proclamations from major browser vendors starting to pull support from Flash, and even [block some Flash ads](http://www.themonitordaily.com/google-chrome-adobe-autoplay/25687/), usage of HTML5’s latest technologies will spread further. Old Flash game devs will become new HTML5 game devs and entire games will be ported over for maintainability’s sake.

The [Gamepad API](https://w3c.github.io/gamepad/) is one of those technologies. It's been mostly ignored by the web industry, but it’s extremely exciting to those that want the browser to become the next console-like gaming experience.

One of the things console developers still haven’t gotten right though, is the on-screen keyboard. You know, that awful thing they shove in your face whenever you need to enter your login, or your name for a high-score. This is the same QWERTY layout that’s present on your desktop keyboard, and was originally invented for typewriters (no joke, [it’s true](https://en.wikipedia.org/wiki/QWERTY#History_and_purposes)). For a user with a controller in their hand this is beyond frustrating, and drags them from that precious immersion game designers strive for so religiously.

### A solution appears!

If you’re a user of Steam, the massive game marketplace that has taken over PC gaming, you might have used their [Big Picture Mode](http://store.steampowered.com/bigpicture/). It’s an amazing tool and gives me more hope for the future. Basically, it turns the Steam interface into something that resembles a console and is much more controller friendly. The “friends” tab of Big Picture Mode presents you with an on-screen keyboard whenever you chat. This has been deemed the “Daisywheel” (after the [old impact printing method](https://en.wikipedia.org/wiki/Daisy_wheel_printing)) This is where our journey begins.

Traditional keyboards implemented for typing on controllers present the user with a big, full-sized QWERTY keyboard. In order to type out a message, the user has to vigorously arrow around the keyboard, requiring anywhere from 2 to 12 actions just to enter a single character. Now imagine a world where a radial keyboard exists, with groups of symbols around the edge, requiring only 2 actions from the user (a flick of the thumb-stick and a tap on an action button) to select any character or number.

If your imagination died with your childhood, no worries (well, some worries), there’s a screenshot below.

![DaisywheelJS Screenshot](http://i.imgur.com/bnDIGMK.png)

The Daisywheel, and in turn [DaisywheelJS](http://daisywheeljs.org/), are implementations of this idea. DaisywheelJS is a port to Javascript and CSS, allowing use in any web project, from a simple site, to a full-scale multiplayer game. Its goal is to be an easy-to-install text entry solution for any project that uses the Gamepad API. This includes HTML5 games. but also includes projects that use tech like [WebVR](http://michaelstaub.com/2015/05/11/typing-in-vr-the-unsolved-problem-of-input/).

### Installation and Setup

Full documentation for DaisywheelJS can be found at the [daisywheel.org](http://daisywheeljs.org/#docs) site, but installation is simple. Include the library, either from [Github](https://github.com/likethemammal/daisywheeljs) or from [npm](https://www.npmjs.com/package/daisywheel), and add the 'daisywheel' class to whatever `input` or `textarea` HTML element you want to receive input. Remember to include the [daisywheel.min.css](https://github.com/likethemammal/daisywheeljs/blob/master/dist/daisywheel.min.css) file, as well.

If you aren't using DOM elements in your project, such as HTML5 Canvas games, you can manually `load()` and `unload()` the Daisywheel with their respective functions. The full list of [options and functionality](http://daisywheeljs.org/#options-and-extensions) can be found in the docs.

After installation, whenever the Daisywheel gets loaded, the user can swiftly input text without using a single key on their keyboard.

If you have trouble setting up your gamepad in the browser, remember, the Gamepad API is experimental. Take a look over the [troubleshooting section](http://daisywheeljs.org/#troubleshooting) of the main site, and try out one of the testers. Not all controllers, browsers, and operating systems are supported. To leave feedback you can hit me up on Twitter [@likethemammal](https://twitter.com/LikeTheMammal) or make an issue on [Github](https://github.com/likethemammal/daisywheeljs/issues). There are a lot of controller configurations out there and only so many can be tested at a time.

### Support the project on Patreon

If you like this project and want to see it continue, consider supporting it on [Patreon](https://patreon.com/daisywheeljs). There, you can vote on which controller will get support next and what the feature schedule will be. You'll have the opportunity to become a beta tester or join in small group chats with other knowledgeable developers.
Check it out and help push gaming forward!

If you're interested in how DaisywheelJS is built, it uses several web technologies. The Gamepad API is obviously one of them. It's also built using [React](http://facebook.github.io/react/) and [Flux](https://facebook.github.io/react/blog/2014/05/06/flux.html). These help organize the program's logic and keeps things maintainable. I gave a talk about them just recently entitled [React and Flux... and a little Redux](http://likethemammal.github.io/reacttalk/) (use the arrow keys).
