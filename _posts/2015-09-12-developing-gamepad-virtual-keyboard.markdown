---
layout: post
title: "Considerations for developing a gamepad virtual keyboard, Part 1: The interface"
tags: flux daisywheeljs gamepad html5
username: likethemammal
---

When working with gamepad controllers, it's general practice to present users with a virtual keyboard to enter text information. Keyboard layouts like [DaisywheelJS’s](http://daisywheeljs.org) and [others](http://www.inference.phy.cam.ac.uk/dasher/images/newdasher.gif) are great alternatives to the traditional QWERTY keyboard presented by console developers. But whether you’re working with an unique layout or not, there are several considerations that go into creating a virtual keyboard. This article discusses those topics. This first part will cover the visual aspects (the input element, keyboard, controls, etc.), and the next part will cover connecting everything to a gamepad (in this case, the HTML5 Gamepad API).

*Note: When I wrote DaisywheelJS I used React and Flux for the keyboard’s logic and view layer. Because of this, I’ll be loosely sprinkling bits of Flux-specific implementation and some ignorable code examples. Most of the article will be a discussion of technology-agnostic considerations, so don’t worry if you don’t use Flux.*

![Zelda's virtual keyboard](http://i27.fastpic.ru/big/2011/1003/a2/1e6d3aa24b1f36fc471a764dae939da2.jpg)

To start off, here are the common pieces of a virtual keyboard interface:

 + **The keyboard layout**: Shows available characters and the currently selected character.
 + **The input fields**: Used to show what the user is typing and retain the text when they're done typing.
 + **The Viewport**: The container around everything.
 + **The controls**: A list of the gamepad controls available to the user.

Each of these elements will be covered individually.

### The keyboard layout

This is the part I’ll talk about the least, because implementation varies greatly with the type of layout. The layout could be a radial keyboard (like the Daisywheel), a traditional keyboard (like QWERTY), or something completely different (like [Beyond Good and Evil’s keyboard](https://youtu.be/euquOpUmUyk)). No matter what layout you have, let’s assume the user can only type one character at a time. This could be accessed by some sort of event or callback that sends the symbol to any part of the app that’s interested. One of those parts is the Input field.

### The inputs

When working with a virtual keyboard, the user has to know what text they’ve currently typed and where their cursor is located in that string of text. For this we’re going to use an HTML input tag. In most cases of a virtual keyboard, there is the input field that is actually part of the form or page, and another input that floats above the virtual keyboard. This second input is used to temporarily show the current text being entered. I’ll be calling the real input *Real Input* and this temporary one *Fake Input*. OnFocus of the Real Input, the keyboard and the Fake Input will be presented. There’s also some other baseline functionality that should be expected from this Fake Input.

 + Shows the cursor's location.
 + Shows current text, this includes text that was already in the Real Input onFocus.
 + Places new text directly after the cursor location and the cursor shifts one character to the right.
 + Cursor can change position using the **mouse**, **keyboard**, OR the **gamepad**.
 + Text can be entered with the **gamepad** OR **keyboard**.

That first one is easy. The HTML input tag automatically shows the current location of the cursor.

<p style=”text-align: center;”>
<input placeholder=”this is an input”>
<p>

The 2nd one is almost as straight-forward. We’ll have to keep track of that current text string value. If you’re using Flux, you’ll probably want to create a Store for the value of the input tag at this point. That way our Fake Input and the Real Input will both mirror the same values when the virtual keyboard is dismissed.

The functionality for those last 3 points all fold into each other, so we’ll discuss them all at once.

Let’s assume you already have a mechanism for getting the currently selected symbol. We'll need a callback for that event, let's call it onGamepadEvent. Inside this callback we receive the new character being typed out. We can't just concatenate it onto the end of our current string because the cursor could be anywhere. So we need to get the current string value from the input, get the cursor location within that string, and then insert the new character at that location of the cursor. We also need to increment the location of the cursor, as I'll discuss next.

```js
// stores/input.js

getValueDivision: function() {
    var value = this.value + '';
    var firstStrPart = value.substring(0, this.cursor),
        secondStrPart = value.substring(this.cursor, value.length);

    return {
        start: firstStrPart,
        end: secondStrPart
    }
},

onGamepadEvent: function(symbol) {
    var valueParts = this.getValueDivision();
    this.value = valueParts.start + symbol + valueParts.end;
    this.cursor++;
    this.emit('change');
},

```

Since the location of the cursor can be changed by the mouse, keyboard, and the gamepad it's impractical to listen for keyboard events and mouse clicks to track the cursor, and in turn, know where to add new characters. Instead, let's use the onChange event for the Fake input and update a value that we store to keep track of the cursor. The DOM provides a decent API to work with text selection and the cursor, called the [Selection API](https://developer.mozilla.org/en-US/docs/Web/API/Selection). You'll need polyfills to get support for IE. Here are the ones for [getCursor](http://stackoverflow.com/a/263796/2687479) and [setCursor](http://stackoverflow.com/questions/1865563/set-cursor-at-a-length-of-14-onfocus-of-a-textbox/1867393#1867393)

```js
// jsx/InputView.js

onInputChange: function() {
    var inputEl = this.refs.input.getDOMNode();
    var value = inputEl.value;
    flux.actions.setInputValue(value);
    this.onInputMouseDown();
},

onInputMouseDown: function() {
    var inputEl = this.refs.input.getDOMNode();
    var cursorLocation = Utils.getCursor(inputEl);
    flux.actions.setInputCursor(cursorLocation);
},

```

Whenever the input is changed we get the new location of the cursor and then manually set it there. This way we can use that same system to connect the DPad of the gamepad to the cursor location as well. Again, if you're using Flux, this is easy to manage using a store for the cursor's location, which in turn reflects that value to anything that needs it.

As I mentioned earlier, because we're manually setting the location of the cursor, we also need to increment that location when we've added a new character. The same principle applies when we delete a character - the cursor location must be decremented.

That last piece of functionality for the input is almost taken care of. When we get new characters from the gamepad event, we already add them to the Fake Input's string. But the user should also be able to fall back to using a keyboard to type if they'd like, so we need to handle that case as well. Luckily we already have an onChange handler for the Fake Input so we'll just have to remember to update the stored string value as well. The Fake Input (the "view") will reflect that update to the store. Fortunately, this manual update **won't** cause another onChange event on the input, and the user won't know the difference.

Good job, that was the hardest part of this interface. It's all easy going from here (until we try to connect the gamepad).

### The viewport

The container for the entire keyboard, the Fake Input, and the controls I will refer to as the "Viewport". The biggest considerations here are keeping the Viewport scaled to the user's window, and keeping it focused (and visible) when they try to type.

That latter part is easy. Create handlers for the Real Input's `onFocus` and `onBlur` events. OnFocus we'll show the entire Viewport and get the Real Input's latest string value. onBlur we'll hide the Viewport, and update the Real Input with the string we've been typing using the Fake Input.

CSS classes or selective JS rendering can handle the Viewport visibility, and Flux can help us out here by tracking whether the viewport should be visible. As I mentioned earlier, a Flux store is also a good place to keep the "current" text value. Updating it when a new value is inherited from the Real Input.

With Viewport visibility taken care of, resizing is the next challenge. I ended up using a combination of JS and CSS to keep the Viewport fullscreen and centered. I wrote CSS that fit the Viewport on screen perfectly for a particular screen size, then I manually scaled its proportions using JS and the `scale()` CSS property. I highly recommend this approach because there is no degradation in quality when using CSS transforms like `scale()`. And because DaisywheelJS doesn't use any images and only uses the DOM to make it's shapes, everything scales crisply. Below is some of the DaisywheelJS’s Modal (its Viewport) React component code.

```js

// jsx/Modal.js

setupSize: _.throttle(function() {
    var innerHeight = window.innerHeight;
    var innerWidth = window.innerWidth;
    var maxSize = (innerWidth < innerHeight) ? innerWidth : innerHeight;
    var padding = 25;
    var scalePrecision = 100;
    var modalHeight = 1000;
    var scaleAmount = Math.floor(scalePrecision * (maxSize / (modalHeight + padding*2))) / scalePrecision;

    this.setState({
        scale: scaleAmount
    });
}, 100),

componentDidMount: function() {
    this.setupSize();
},

componentWillMount: function() {
    window.addEventListener('resize', _.bind(this.setupSize, this));
},

componentWillUnmount: function() {
    window.removeEventListener('resize', _.bind(this.setupSize, this));
},

```

### The controls

This is another part of the interface that depends on implementation. In this article we've discussed implementing Backspace and using the DPad, so the UI should at least reflect those. A Space button is also something to consider, and it's easy to implement.

The larger challenge comes from including multiple character sets, the most obvious being "capital characters". This might also includes sets for other languages, and in DaisywheelJS's case, [even Emoji Fonts](http://daisywheeljs.org/#options-and-extensions). Toggling or cycling through character sets should be controlled through some button as well, so we'll add that to the list of controls. Tracking the currently selected symbol is another one of those pieces of state that is so easily managed through Flux. Since the keyboard view needs to know what characters to show and the Fake Input needs to know what character was just selected, a store is the perfect place to manage the character sets.

And that should be all the pieces needed for the basis of a virtual keyboard's interface. The next article will cover connecting that interface to a gamepad and parsing through the stream of Gamepad events. Share any cool keyboard layouts you've seen and leave your comments below.

![A virtual keyboard](https://c2.staticflickr.com/4/3231/3697039123_3f3e328c87.jpg)
