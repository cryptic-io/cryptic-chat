#Group/Team Blog

This blog starter kit was created as a baseline for a group of people to post articles to a common blog that has a similar focus or mindset. It runs on [Github Pages](https://pages.github.com/) and leverages [Markdown](http://daringfireball.net/projects/markdown/) as a means to post articles, meaning posts can be created by simply merging in the file or making a pull request for others to edit. It requires no back-end server, account information, or command line experience to actually post articles, which allows for non-technical team members to post with ease.

##What is Github Pages

Github Pages is the free hosting platform available for any Github repo that turns on the feature. It works with standard HTML pages or with a blogging platform called [Jekyll](http://jekyllrb.com/). Jekyll reads through Markdown files and outputs static HTML files that are already wrapped in a template similar to the rest of the site. If you're interested in working with Jekyll more info can be found [here](http://jekyllrb.com/docs/home/), otherwise read on.

##What is Markdown

As mentioned articles with Jekyll are written in Markdown. Markdown is a simple way to represent plain text in a formatted style, much like the tools available in Microsoft Word or Google Docs. Its easy to learn and in many cases can be no different than plain text if no emphasis is needed. Its not something that needs to be learned all at once as there are [cheat sheets](https://github.com/adam-p/markdown-here/wiki/Markdown-Cheatsheet) available to easily copy and paste from.

Github comes with its own Markdown editor with a preview section that will give a decent representation of what the HTML will look like. There is also an [excellent Chrome Extension](https://github.com/pioul/Minimalist-Markdown-Editor-for-Chrome) that works much the same way.

#Basic Usage

##Posting an article

To create a post a Markdown file needs to be created in the `_posts` directory. Other than writing the main content in Markdown there are a few other things needed to post an article with this group blog.

##Member authoring data

Before posting an article a member's data must be created for that author. Inside the `_data` directory in `members.yml` each member has a block of variables that will be used to associate this authoring information with that member each time they post from then on. The structure of the variables is in [YAML](http://en.wikipedia.org/wiki/YAML) but doesn't require an intricate knowledge of the data structure. Simply copy and paste the example below, replacing the appropriate information.

With this data included in the `members.yml` file the only thing that is needed to attach the author's info in each post in the future is to include the member's `username` in the Front Matter of the post.

##Front Matter

The Front Matter of a post is the block of variables at the beginning of the post's file that enhance the post in some way. The way this group blog is setup the Front Matter has a few required and a few optional front matter variables. Some are self explanatory and some not-so-much, so an explanation for each is below.

###layout

The **layout** variable should ALWAYS be set to `post`. It determines which template the article will use and in this situation that will always be `post`.

###title

This is the name of the post. This will appear in the header and will also be the name of the link when a user bookmarks the post's page.

###tags

This is a space separated list of the tags associated with the post. The tags page and tags cloud will also be populated with all the tags used throughout all the posts and will list out the post associated.

###username

This is should have the same value as the `username` in the member's data in the `members.yml` file.

###demo

One of two **optional** Front Matter variables. This is the link to a demo of what the author might be writing about. If its not included the design will compensate for this.

###source

The other **optional** Front Matter variable. This is the link to the source files that might be mentioned in the post. Again, if its not included the design will take care of it.

##Naming the post file

The way the post file is named will determine how the url looks. It should include a date in the `yyyy-mm-dd` format and then the dash-separated name that will be used as the post's link.

#Advanced Usage

##Emojis

Use emojis within your Jekyll posts or pages as you would elsewhere on GitHub. The list of supported emojis can be found [here](http://www.emoji-cheat-sheet.com/).

##@Mentions

@Mentions can used in a post to link to a Github user's profile but won't notify said user directly.

##Changing the design

###Setting up a local development

To change the design or file structure a local development environment must first be setup. This can be done by following the directions on these pages, [Using Jekyll with Pages](https://help.github.com/articles/using-jekyll-with-pages/) and [Using Jekyll Plugins with GitHub Pages](https://help.github.com/articles/using-jekyll-plugins-with-github-pages/).

###File Structure

Most of the file structure is explained in the [Jekyll documentation](http://jekyllrb.com/docs/structure/). The only thing peculiar thing with this blog's structure is that the CSS files are broken into their own relevant modules in the `_includes` directory and then concatenated into the `styles.css` file. This leverages a Liquid templating hack and also allows for the use of variables within CSS without SASS.

##Versions and Browser Support

The version numbers for all dependencies and plugins can be found at [here](https://pages.github.com/versions/).

As of now browser support is IE 9+ because of some CSS functionality used.