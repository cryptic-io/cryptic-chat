
Group / Team Blog

This blog starter kit was created as a baseline for a group of people to post articles to a common blog that has a similar focus or mindset. It runs on Github Pages and leverages Markdown as a means to post articles, meaning posts can be created by simply merging in the file or making a pull request for others to edit. It requires no back-end server, account information, or command line experience to actually post articles, which allows for non-techinal team members to post with ease.

What is Github Pages

Github Pages is the free hosting platform available for any github repo that turns on the feature. It works with standard HTML pages or with a blogging platform called Jekyll. Jekyll reads through Markdown files and outputs static HTML files that are already wrapped in a template similar to the rest of the site. If you're interested in working with Jekyll more info can be found here, otherwise read on.

How to: Markdown

As mentioned articles with Jekyll are written in Markdown. Markdown is a simple way to represent plain text in a formatted style, much like the tools available in Microsoft Word or Google Docs. Its easy to learn and in many cases can be no different than plain text if no emphasis is needed. Its not something that needs to be learned all at once as there are cheatsheets available to easily copy and paste from.

Posting an article

Otherthan writing in the content in Markdown there are a few other things needed to post an article with this group blog.

Member authoring data

Before posting an article a member's data must be created for that author. Inside the _data directory in members.yml each member has a block of variables that will be used to associate this authoring informaton with that member each time they post from then on. The structure of the variables is in YAML but doesnt require an intrecate knowledge of that data structure. Simply copy and paste the example below, replacing the appropiate information.

With this data included in the members.yml file the only thing that is needed to attach the author's info in each post in the future is to include the member's username in the Front Matter of the post.

Front Matter

The Front Matter of a post is the block of variables at the beginning of the post's file that enhance the post in some way. The way this group blog is setup the Front Matter has a few required and a few optional front matter variables. Some are self exlpanitory and some not-so-much, so an explanation for each is below.

layout

The layout variable should ALWAYS be post. It determines which template the article will use and in this situation will always be post.

title

This is the name of the post. This will appear in the header and will also be the name of the link when a user bookmarks the post's page.

date

The date has to be in this format yyyy-mm-dd hh:mm:ss

tags

A space seperated list of the tags associated with the post. The tags page and tags cloud will also be populated with all the tags used throughout all the posts and will list out the post associated.

username

This is the username that should have the same value as the username in the member's data in the members.yml file.

demo

One of two optional Front Matter variables. This is the link to a demo of what the author might be talking about. If its not included the design will compensate for this.

source

The other optional Front Matter variable. This is the link to the source files that might be mentioned in the post. Again, if its not included the design will take care of it.

Naming the post file

The way the post file is named will determine how the url looks. It should include a date and then the dash-seperated name that will be used as the post's link.