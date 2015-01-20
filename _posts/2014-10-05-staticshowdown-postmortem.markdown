---
layout: post
title: Sock Singles, a post mortem on our static showdown entry
tags: clojurescript javascript react firebase
username: marcopolo
demo: "https://sock-singles.firebaseapp.com/"
crosspost: http://marcopolo.io/2014/02/11/staticshowdown-postmortem.html
---

# Static Showdown
The static showdown was a hackathon that centered around building a completely static site.
The purpose was to highlight [divshot](http://www.divshot.io/), a company that specializes in static page hosting.

# Sock Singles
Our idea was inspired by the new .singles TLD. We came up with sock.singles as a place to
find your matching sock.

## The Pitch
Sock Singles is the go to site for finding the pair to your single sock.
It matches your socks across several different layers of compatibility, to make sure
that we find the perfect match for you.

## Market Research
100% of people who wear socks have lost a single sock, sock singles is for them!

-----
It was a lot of fun making such a ridiculous site. We parodied dating sites, which led to
golden puns such as a camo colored sock labeled: "I'm hunting for my _sole_ mate".
Being as ridiculous as it it was, we stilled learned valuable lessons from the tools we
were using.


# React
I cannot stress enough how cool [React](http://facebook.github.io/react) is! It takes out
a substanial source of complexity in UI's by "re-rendering" everything all the time.
Instead of setting the intial DOM and trying to figure out how to best update the DOM
after state changes, you imagine everything will be re-rendered after a state change.
React handles the optimizations to make this fast. And that's the way tools should work.
We shouldn't have to bake in optimizations every chance we get.

### React - Cons
It wasn't a perfect honeymoon with React. Our team was very familiar with Backbone, and
the Backbone style of setting Views. We kept trying to reach towards using events to pass data
between the child and the parent. We were passing the Backbone router into components, as a way
to mutate to global state. React didn't yell at us, but I could tell it was disappointed.
In retrospect, very few things should have access to the router. The router allows
changing the global state from anywhere. With such power, it's important to keep it on a short
leash.

### React V. Backbone Views
React's model is a very composable hierarchy of components. This hierarchy allows you to trace
exactly what caused a state change. In contrast, Backbone Views are a sort of cesspool of events.
It is nearly impossible to know what triggered what, and this leads to very _spooky_ behaviors.

# Clojurescript
I wrote parts of sock singles in Clojurescript. This allowed me to quickly simulate sock data
so the other two team members could start working with data. Making simlated data was as easy
as a call to rand-nth. Here is a snippet of the code that simulated socks:

```clojure
(def stock-titles
  ["Fuzzy Wuzzy" "Sock it to me it" "Linty Linda" "Sleepless in Sockeatlle"
   "Socker Star" "Sockretes"])

(defn get-socks [count]
  (for [_ (range count)]
    {:image-path (rand-nth stock-pictures)
     :username (rand-nth stock-usernames)
     :title (rand-nth stock-titles)}))

(defn getSocks
  ([count]
   (let [promise (gen-promise)]
     (.resolve promise (clj->js (get-socks count)))
     promise))
  ([]
   (getSocks 10)))
```

Then I just exposed a function that converted the cljs datastructures into
javascript datastructures, wrapped it in a promise and I was good to go! My team members couldn't
tell the difference, and I wrote the code in half the time! win/win!

<br/>

I later ran into a problem writing the filters in Javascript. I needed to display the instersection
of 3 filtered list of socks. Instead of coming up with a long (bug ridden) javascript
implementation, I shelled out to Clojurescript and used sets and intersection to get the job done.
I was afraid it would be noticeably slow, but, thankfully, I was wrong!

```clojure
(defn ->vecs [arrays]
  (mapv js->clj arrays))
(defn intersect-vecs [vecs]
  (apply set/intersection
         (map set vecs)))
(defn intersectArrays [arrays]
  (-> arrays ->vecs intersect-vecs clj->js))
```
Only 7 lines of code to find the intersection of N javascript arrays.


# Firebase
Firebase dutifully performed all the tasks I asked of it and more. Even setting up hosting on it
was trivial. It also allowed me to setup Github Auth with a couple of clicks. My only gripe with
Firebase is that it doesn't provide a way to do more advanced queries with data. For example,
to fetch the whole set of socks, I had to first fetch all the users
and locally parse all the users to get their socks. It worked, but it added incidental complexity.

# Divshot
I don't really understand Divshot. I don't see the benefit in having a service that just does
Static Hosting. I hope I'm wrong, and I get to see some interesting things come out. As for
actually using divshot, I got stuck with a "Deployed Failed" message. No actual errors or help,
after some digging I found out I had to do ` divshot push production ` instead of ` divshot push`.

# ChromeOS
I had some hope for Chrome OS initially, but that quickly vanished after seeing a team member
develop in it. We had a lot of trouble simply viewing files. Symlinks don't show up in the file
viewer, and it sometimes just doesn't show files at all. I love the Chrome dev tools for debugging,
but I don't think they are a viable development platform. I'd get merge conflicts just because
dev-tools did some weird formatting.

# The Team
I'd like to thank [Marlon](https://github.com/marlonlandaverde) and
[Dolphin](https://github.com/likethemammal) for putting up with me and building this
amazing project!

# The Site
Well that's enough talk check it out! [Sock Singles](https://sock-singles.firebaseapp.com/)
<br/>
You'll need a github account if you want to sell your sock :)
