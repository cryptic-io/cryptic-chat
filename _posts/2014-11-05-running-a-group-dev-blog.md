---
layout: post
title: Running a Group/Team Dev Blog through Github Pages
tags: jekyll github-pages dev-blog
username: likethemammal
---

After searching for sometime for a group dev blog solution, I decided to create my own using Jekyll and Github Pages. There has been talk amongst my friends about making a blog that could be a more persistent place to post the things we learn, rather than dropping a few lines in our group chat and having it lost to the sea of time. There were a few base requirements for our preferred blogging platform. It had to:

#####Allow for multiple authors
So anyone can make a post and push it out whenever they felt like it.

#####Be free to host
So we didn't have to shell out money at any point, which removes a lot of the guilt of not posting and encourages more people to join the process.

#####Reduce the bottlenecks of having a single editor
Because this is a **group** blog there shouldn't be any hierarchy to getting a post live. At the same time there needs to be a decent peer review process as to maintain article quality.

#####Be easy to publish
Writing the posts shouldn't require any technical expertise to load up a local environment or intimate knowledge of a special text editor.

#####Be extremely Customizable
Because we're developers there is the expectation that our blog will have the exact look and feel we want. And the process to change that should be straightforward.

##In steps Github Pages

As described in the Readme [here](http://github.com/likethemammal/group-dev-blog), this blogging platform runs on Jekyll using Github Pages. Posts are written in Markdown, which is already very human-readable, and allows for the publishing and editing process to be run entirely through pull requests. This system of pull requests also allows for a vetting process for new authors. Once you get an article reviewed by 3 other authors and published, you're given merge power. Meaning any 3 authors can get an article live without being held up by a tech-lead or a head-editor. And, because it is just running static HTML files, all the power of CSS is at our fingertips, to customize the site as we see fit.

This platform has yet to be truly "battle-tested", so the Readme and group's ideology will evolve over time. That being said, it should allow the group to scale to a decent size without causing any issues. If you're interested in finding out more about how this blog works visit the documentation [here](http://github.com/likethemammal/group-dev-blog).