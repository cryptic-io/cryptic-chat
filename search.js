//Modified and taken from http://stackoverflow.com/a/24587512/2687479 9/7/14

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

getJSON('http://' + window.location.host + '/search.json').then(function(data) {
  console.log('Your Json result is:  ', data); //you can comment this, i used it to debug

}, function(status) { //error detection....
  alert('Something went wrong.');
});