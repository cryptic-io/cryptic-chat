;(function(){
  var postsJSON = [];
  var searchURL = 'http://' + window.location.host + '/search/search-data.json';

  // create anelement to show when there are no results
  var emptyElem = document.createElement('li');
  emptyElem.className = 'empty-results';
  emptyElem.innerHTML = 'No results to display';

  // fetch a given url. returns a promise
  var getJSON = function(url) {
    return new Promise(function(resolve, reject) {
      var xhr = new XMLHttpRequest();
      xhr.open('get', url, true);
      xhr.responseType = 'json';
      xhr.onload = function() {
        var status = xhr.status;
        if (status == 200) {
          resolve(xhr.response);
        } else {
          reject(status);
        }
      };
      xhr.send();
    });
  };

  // references to input and results elements
  var input = document.getElementById('search-input');
  var resultsContainer = document.getElementById('results');

  // grabs search query from input element, then loops over each post checking for a matching
  // post title or tags
  var searchPosts = function(){
    var query = input.value;
    var results = [];

    // only search through posts if there's actually something to search for
    if( query ){
      query = query.toLowerCase().trim();

      postsJSON.forEach(function(post){
        // loop through each post and check if the title or one of its tags contains the
        // search query
        if( !post || !post.title ){
          return;
        } else if( post.title.toLowerCase().indexOf(query) >= 0 ){
          results.push(post);
        } else {
          for( var i = 0; i < post.tags.length; i++ ){
            if( post.tags[i] && post.tags[i].toLowerCase().indexOf(query) >= 0){
              results.push(post);
              break;
            }
          }
        }
      });
    }

    // clear the results container and populate it with matching results, if any
    resultsContainer.innerHTML = '';
    if( !results.length ){
      resultsContainer.appendChild( emptyElem );
    } else {
      results.forEach(function(post){
        // create an anchor element with post link and title
        var a = document.createElement('a');
        var linkText = document.createTextNode(post.title);
        a.appendChild(linkText);
        a.title = post.title;
        a.href = post.href;
        // create a list element and add the anchor element as a child
        var resultElem = document.createElement('li');
        resultElem.appendChild(a);
        // append list element to list of results
        resultsContainer.appendChild(resultElem);
      });
    }
  };

  var init = function(){
    // search for matching posts when input is entered
    input.addEventListener('input', searchPosts);
    // do an initial search just incase input is already populated (ie you search for something,
    // click a link, then press the back button. or if it took a while for the results json to load
    // and you already started typing into the search input)  
    searchPosts();
  }
  
  // immediately fetch all posts from the server
  getJSON( searchURL ).then(function(data) {
    // save the results
    postsJSON = data;
    // kick it all off
    init();
  }, function(status) {
    console.log('Error fetching search data');
  });

})();
