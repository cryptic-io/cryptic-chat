---
layout: post
title: Caveats of working with Jekyll and Github Pages
tags: jekyll github-pages liquid
username: likethemammal
---

Github Pages uses Jekyll, an extremely powerful and easy to use parsing engine that builds static websites. This means setting up a blog to use GitHub Pages is straightforward and frictionless. However, since you're running the Github Pages flavor of Jekyll, you're limited in what plugins and what version of Jekyll you can use (though Github does make a concerted effort to keep it up-to-date). After working intimately with the platform for sometime, I'm putting my knowledge in writing to share with others and help myself later on in the future.

###Working with Liquid

Jekyll uses the Liquid templating language to build its templates. The documentation for this language on the Jekyll site is almost non-existent and it took me a while to find exactly what I was looking for. Here are the docs to almost everything you would want to know about how Liquid works.

[https://github.com/Shopify/liquid/wiki/Liquid-for-Designers](https://github.com/Shopify/liquid/wiki/Liquid-for-Designers)

###Complex features with a simple platform

When using Github Pages as the target platform there is a [very limited number of Jekyll plugins](https://help.github.com/articles/using-jekyll-plugins-with-github-pages/) that can be used. Surprisingly, there is a whole variety of complex functionality that can be accomplished with just a static page generator and a templating language. These range from adding search functionality to creating tag clouds. I won't go into the details here because there's already an [amazingly useful article](http://www.developmentseed.org/blog/2011/09/09/jekyll-github-pages/) written on the subject.

####CSS Templating

Because you're working with a page generator, you're able to take advantage of many features that would normally require a build script, such as merging CSS files.

Personally, I keep my CSS separated into files that are relevant to the section I'm working with. This is fine but without concatenation this means that the end-user has to deal with multiple network requests for each of these file. This is a **huge** experience killer and will frustrate anyone on a mobile data connection.

Because of the way Jekyll works you're actually able to automate concatenation into a single file and still keep the development files separate. Here's an example:

```css

---
ellipse: "white-space: nowrap; overflow: hidden; text-overflow: ellipsis;"
boxShadow: "box-shadow: -1px 1px 2px rgba(0,0,0,0.2);"
buttonShadow: "box-shadow: 0 1px 1px rgba(0,0,0,0.1);"
---
{% raw %}
{% include css/libs/navigation.css %}
{% include css/libs/css-slider.css %}
{% include css/navigation-changes.css %}
{% include css/posts.css %}
{% include css/post.css %}
{% include css/members.css %}
{% endraw %}

```

By using `includes` its possible to combine all the files into one. A very exciting side affect of this is that you can also create global CSS variables, usable in any of the included files, like this:

```css

#post-content {
    font-size: 19px;
    padding: 11px 22px;
    background: #fff;
    {% raw %}
    {{ page.boxShadow }}
    {% endraw %}
}

```

###Jekyll Pitfalls

When working with any new platform there are random quirks and pitfalls that complicate the debugging process and cause extra needless stress. I, of course, ran into a few of those along the way and just wanted to document them so the internet would have some reference for these issues.

####Capture variables can't be dash separated

When using Liquid's `capture` tag feature the variable names used can't be `dash-separated`. I don't know why, it just an edge-case I ran into. I recommend using `camelCase` instead in these instances.

####Restart Jekyll after changing _config.yml

Throughout development of this blog I used the `jekyll serve --watch` command recommended by the Github Pages documentation. This makes it easy to automatically build and serve the static files when changes are made to the development files. Apparently, this doesn't apply to the `_config.yml` file. Several times I made changes to the config file, expecting to see the results in my browser, only to realize that I needed to rerun the Jekyll `serve` command to actually apply said changes. Thinking back, this makes some sort of sense, because Jekyll needs some config settings when it starts up. At any rate, I never once saw any documentation mentioning this.

###Wrapping Up

Hopefully some of these points help you find the answers you're looking for. If you've noticed something strange about Jekyll, Liquid, or Github Pages in your development process or have any tips, drop it in the comments below.
