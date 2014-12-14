---
layout: post
title: An Intro to Functional Reactive Programming in UIs
tags: javascript react frp functional reactive elm om
username: marcopolo
demo: http://jsfiddle.net/jf2j62wj/10/
---

# An Intro to Functional Reactive Programming in UIs


Maybe you've heard of [React][react], [Om][om],
or [Elm][elm], and wondering: what's the deal with
functional reactive programming (FRP)?

This post will act as primer on FRP using vanilla JS, but the ideas presented
here translate pretty easily in any language and UI system.

So let's start with an informal, pragmatic definition of FRP:

> Use streams of data to create the application state (data)

And

> Build a UI given only the application state with pure functions (view)

## Streams and arrays
You can imagine streams of data as a set of values over time.

A stream of numbers representing a counter would look like:
```
[0,1,2,3,4,5,6,...]
```
Each number is essentially a snapshot of the value at that time.

Streams are similar to arrays, but the main difference is time.
An immutable array has all the values it will ever have when it is created, while a stream represents all the values that have happened and will
happen.

Here's a concrete example: You are an owner of an exclusive restaurant.
It's so exclusive that people have to make reservations months in advance.
Every night you have a list of people at your restaurant (because they've
already made reservations). Imagine the list being `[amy, sally, bob]`.
To count the number of guests, we would just reduce over the list
adding 1 for every guest. If we wanted to know how much each guest spent
we would map against a function that tells us the guest's bill.

This is just a normal array with normal map/reduce construct.
For completeness here's the equivalent code.
```javascript
var guests = ["amy", "sally", "bob"]
var bills = {"amy":22.50, "sally":67.00, "bob":6.00}

// Count the guests
guests.reduce(function(sum, guest){return sum+1;}, 0)
// => 3
// Get the bills
guests.map(function(guest){return bills[guest]})
// => [22.5, 67, 6]
```

Unfortunately Sally had some bad fish and died after eating at your
restaurant, so everyone has cancelled their reservations and you are
now a fast food place. In this case you don't have a list of guests,
instead you have a _stream_ of people who come in and order food.
`Frank` might come in at 10 am, followed by `Jack` at 2 pm. To get
similar data as before we would again map/reduce over the stream,
but since we are operating over a stream that never ends, the values
from map/reduce themselves become streams that never end.

Here is some equivalent pseudo code for streams that calculates
the `guestCounts` and the `guestBills`.
```javascript
guests      = [... time passes ..., Frank, ... time passes ..., Jack, ... ]

guestCounts = [... time passes ..., 1,     ... time passes ..., 2, ... ]
guestBills =  [... time passes ..., 5.50,  ... time passes ..., 6.50, ... ]
```

So a stream is just like an array that never ends, and represents
snapshots of time.

Now that we have an intuitive idea what streams are, we can actually
implement them.

## Streams of data

A stream of numbers representing a counter would look like:
```
[0,1,2,3,4,5,6,...]
```

If we wanted to keep track of how long someone was on our page,
we could just display the latest value of the counter stream
 in our UI and that would be enough.


A more involved example: Imagine we had a stream of data
that represents the keys pressed on the keyboard.

```
["p","w","n","2","o","w","n",...]
```

Now we want to have a stream that represents the state of the system,
say the amount of keys pressed.

Our key count stream would look like:

```
["p","w","n","2","o","w","n",...]
=>
[ 1,  2,  3,  4,  5,  6,  7, ...]
```

This transformation would happen with a reducing function.

```javascript
var keyCountReducer = function(reducedValue, streamSnapshot){
 return reducedValue + 1
}
```
This function takes in the stream value, and a reduced value so far, and
returns a new reduced value. In this case a simple increment.

We've talked about streams for a while now, let's implement them.

In the following code, we create a function that will return an object with two
methods: `observe` for registering event listeners and `update` for adding a value
to the stream.
```javascript
// A function to make streams for us
var streamMaker = function(){
  var registeredListeners = [];
  return {
    // Have an observe function, so
    // people who are interested can
    // get notified when there is an update
    observe: function(callback){
      registeredListeners.push(callback)
    },

    // Add a value to this stream
    // Once added, will notify all
    // interested parties
    update: function(value){
      registeredListeners.forEach(function(cb){
        cb(value);
      })
    }
  }
}
```

We also want to make a helper function that will create a new reduced stream
given an existing `stream`, a `reducingFunction`, and an `initialReducedValue`:
```javascript
// A function to make a new stream from an existing stream
// a reducing function, and an initial reduced value
var reducedStream = function(stream, reducingFunction, initialReducedValue){
  var newStream = streamMaker();
  var reducedValue = initialReducedValue;

  stream.observe(function(streamSnapshotValue){
    reducedValue = reducingFunction(reducedValue, streamSnapshotValue);
    newStream.update(reducedValue);
  });
  return newStream;
}
```


Now to implement the keypress stream and count stream.
```javascript
// Our reducer from before
var keyCountReducer = function(reducedValue, streamSnapshot){
 return reducedValue + 1;
}

// Create the keypress stream
var keypressStream = streamMaker();
// an observer will have that side effect of printing out to the console
keypressStream.observe(function(v){console.log("key: ",v)});

// Whenever we press a key, we'll update the stream to be the char code.
document.onkeypress = function(e){
  keypressStream.update(String.fromCharCode(e.charCode))
}

// Using our reducedStream helper function we can make a new stream
// That reduces the keypresses into a stream of key counts
var countStream = reducedStream(keypressStream, keyCountReducer, 0)
countStream.observe(function(v){console.log("Count: ",v)})
```


Now with the new stream we can display it like we did before.

Which leads us into our next point...

## Rendering UIs given data

Now that we have a system for generating state through streams,
let's actually show something off.

This is where React.js shines, but for the purpose of this post we'll
build our own system.

Let's say at one point in time our data looks like:

```javascript
{"Count":1}
```

And we want to render a UI that represents this information.
So we'll write a simple piece of JS that renders html directly from the map.
To keep it easy, we'll use the keys as div ids.

```javascript
//Pure Function to create the dom nodes
var createDOMNode = function(key, dataMapOrValue){
  var div = document.createElement("div");
  div.setAttribute("id",key);

  // Recurse for children
  if (typeof dataMapOrValue === "object" && dataMapOrValue !== null){
    Object.keys(dataMapOrValue).forEach(function(childKey){
      var child = createDOMNode(childKey, dataMapOrValue[childKey]);
      div.appendChild(child);
    })
  } else {
    // There are no children just a value.
    // We set the data to be the content of the node
    // Note this does not protect against XSS
    div.innerHTML = dataMapOrValue;
  }
  return div;
}

// Render Data

var render = function(rootID, appState){
  var root;
  // Check if the root id is even defined
  if (document.getElementById(rootID) === null){
    // We need to add this root id so we can use it later
    root = document.createElement("div");
    root.setAttribute("id",rootID);
    document.body.appendChild(root);
  }

  root = document.getElementById(rootID);
  // Clear all the existing content in the page
  root.innerHTML = "";
  // render the appState back in
  root.appendChild(createDOMNode(rootID, appState));
}

render("counter", {"Count":1})
```

After running this code on a [blank page](about:blank) we have a page
that says `1`, it worked!

A bit boring though, how about we make it a bit more interesting by updating
on the stream.

## Rendering Streams of data

We've figured out how streams work, how to work with streams, and how to
render a page given some data. Now we'll tie all the parts together; render
the stream as it changes over time.

It really is simple. All we have to do is re-render whenever we receive
a new value on the stream.

```javascript
// Let's observe the countstream and render when we get an update
countStream.observe(function(value){
  render("counter", value)
})

// And if we wanted to render what the keypress stream tells us, we can do so
// just as easily
keypressStream.observe(function(value){
  render("keypress", value);
});
```

## Single App State
A single app state means that there is only one object that encapsulates the
state of your application.

Benefits:
* All changes to the frontend happen from this app state.
* You can snapshot this state and be able to recreate the
frontend at any point in time (facilitates undo/redo).

Downsides:
* You may conflate things that shouldn't be together.

Having a single place that reflects the whole state is pretty amazing,
how often have you had your app get messed up because of some rogue event?
or hidden state affecting the application, or an ever growing state
scattered around the application.

No more.

A single app state is a natural end to the directed acyclic graph that
we've created with streams.

```
stream1 -> mappedStream
                        \
                         mergedStream -> appStateStream
                        /
stream2 -> reducedStream
```

## Implementing Single App State
In our previous example we had two pieces of state,
the counter and the keypress. We could merge these together into one stream, and
then form a single app state from that stream.

First let's make a helper function that will merge streams for us. To keep it
general and simple we'll take only two streams and a merging function.
It will return a new stream which is the merge of both streams with the mergeFn.
```javascript
// A merge streams helper function
var mergeStreams = function(streamA, streamB, mergeFn){

  var streamData = [null, null];
  var newStream = streamMaker();

  streamA.observe(function(value){
    streamData[0] = value;
    newStream.update(mergeFn.apply(null,streamData));
  });
  streamB.observe(function(value){
    streamData[1] = value;
    newStream.update(mergeFn.apply(null,streamData));
  });

  return newStream;
}
```
This implementation will call the merge function with the latest value from the
streams or null if the stream hasn't emitted anything yet. This means the output
can return duplicate values of one of the streams.

(As a side note, the performance impact of duplicate values can be mitigated
 with immutable datastructures)

We want to put both the keypress and the counter in one object, so our
merge function will do just that.
```javascript
var mergeIntoObject = function(keypress, counter){
  return {"counter" : counter,
          "keypress": keypress};
};
```

Now to create the single app state stream, and render that single app state.
```javascript
var appStateStream = mergeStreams(keypressStream, countStream, mergeIntoObject);

appStateStream.observe(function(value){
  render("app", value);
});
```

## Final Code
Most of these functions are library functions that you wouldn't need to implement
yourself. The final application specific code would look like:
```javascript
// Create the keypress stream
var keypressStream = streamMaker();

// Whenever we press a key, we'll update the stream to be the char code.
document.onkeypress = function(e){
  keypressStream.update(String.fromCharCode(e.charCode))
}

var keyCountReducer = function(reducedValue, streamSnapshot){
  return reducedValue + 1
}
// Using our reducedStream helper function we can make a new stream
// That reduces the keypresses into a stream of key counts
var countStream = reducedStream(keypressStream, keyCountReducer, 0)

var mergeIntoObject = function(keypress, counter){
  return {"counter" : counter,
          "keypress": keypress};
};

var appStateStream = mergeStreams(keypressStream, countStream, mergeIntoObject);

appStateStream.observe(function(value){
  render("app", value);
});
```

You can see a running version of this code [here](http://jsfiddle.net/Ld3o1Lm5/2/)


## The render, a closer look

So what does the render actually do?


Well, it clears the inner html of a containing div and adds an element inside of it.
But that's pretty standard, how are we defining what element is created?
Why yes, it's the createDOMNode function. In fact, if you wanted your data displayed
differently (e.g. in color, or upside down) all you'd have to do is write your own
createDOMNode function that adds the necessary styles or elements.

Essentially, the `createDOMNode` function controls what your UI will look like.
createDOMNode is a pure function, meaning for the same set of inputs, you'll
always get the same set of outputs, and has no side effects (like an api call).
This wasn't a happy accident, FRP leads to a
design where the functions which build your UI are pure functions!
This means UI components are significantly easier to reason about.

## Time travel
Often when people talk about FRP, time travel is bound to get brought up.
Specifically the ability to undo and redo the state of your UI. Hopefully, if
you've gotten this far, you can see how trivial it would be to store the data
used to render the UIs in an array and just move forward and backward to
implement redo and undo.


## Performance
If you care about performance in the slightest, you probably shuddered when
I nuked the containing element and recreated all the children nodes. I don't
blame you; however, that is an implementation detail. While my implementation
is slow, there are implementations (e.g. React) that only update the items and
attributes that have changed, thus reaping performance benefits with no cost
to the programmer! You are getting a better system for modeling UIs and
the performance boosts for free! Furthermore a lot of smart people are working
on React, and as it gets faster, so will your app. Without any effort on your
part.

## Now with actual libraries

A lot of what we wrote was the library to get streams up and running,
however those already exists (e.g. [Bacon.js][bacon] and [React.js][react])

A couple quick notes if this is your first time looking at React.js or Bacon.js.

`getInitialState` defines the initial local state of the component.
`componentWillMount` is a function that gets called before the component
is placed on the DOM.

`<stream>.scan` is our reducing function in Bacon.js parlance.

```javascript
// Our streams just like before
var keypressStream = Bacon.fromEventTarget(document.body, "keypress")
.map(function (e) {
  return String.fromCharCode(e.charCode)
});

var countStream = keypressStream.scan(0, function (count, key) {
  return count + 1;
});

var KeyPressComponent = React.createClass({
  getInitialState: function(){
    return {"count":0, "keypress":"<press a key>","totalWords":""};
  },
  componentWillMount: function () {
    this.props.countStream.onValue(function (count) {
      this.setState({"count": count});
    }.bind(this));

    this.props.keypressStream.onValue(function (key) {
      this.setState({"keypress": key});
    }.bind(this));

    // Add something extra because why not
    this.props.keypressStream.scan("", function (totalWords, key) {
      return totalWords + key;
    })
    .onValue(function (totalWords) {
      this.setState({"totalWords": totalWords});
    }.bind(this));
  },
  render: function () {
    return React.DOM.div(null,
      React.createElement("h1", null, "Count: " + this.state.count),
      React.createElement("h1", null, "Keypress: " + this.state.keypress),
      React.createElement("h1", null, "Total words: " + this.state.totalWords))
    }
  });

React.render(React.createElement(KeyPressComponent, {
  keypressStream: keypressStream,
  countStream: countStream
}), document.body);
```
jsfiddle for this code [here](http://jsfiddle.net/jf2j62wj/10/).

## Closing Notes
[React][react] is great for reactively rendering the ui.
[Bacon.js][bacon] is a great library that implements these streams.

If you're looking to really delve into FRP:
[Elm][elm] has a well thought out FRP system in a haskell like language.

If you're feeling adventurous give Om & Clojurescript a shot.
[Om][om] is a great tool that adds immutability
to React, and brings React to Clojurescript

Finally, Evan Czaplicki (Elm creator) did a [great talk on FRP](https://www.youtube.com/watch?v=Agu6jipKfYw)

[react]: https://facebook.github.io/react/
[om]: https://github.com/swannodette/om
[elm]: http://elm-lang.org/
[bacon]: http://baconjs.github.io/
