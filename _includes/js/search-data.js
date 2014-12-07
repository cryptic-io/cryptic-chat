;(function(){

window.postsJSON = [
{% for post in site.posts %}
{% include post.json %},
{% endfor %}
null
]

})();
