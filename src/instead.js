// http://stackoverflow.com/questions/901115/how-can-i-get-query-string-values-in-javascript
function getParameterByName(name) {
  name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
  var regex = new RegExp( "[\\?&]" + name + "=([^&#]*)" );
  results = regex.exec(location.search);
  return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}

var siteUrl = getParameterByName( "site" );

var site = document.getElementById( "site" );
site.innerText = siteUrl;

function goForward() {
  var allowedUrls = JSON.parse( localStorage.allowedUrls );
  allowedUrls[siteUrl] = {};

  localStorage.allowedUrls = JSON.stringify( allowedUrls );
}

// TODO: Give them an hour on the site
var forward = document.getElementById( "forward" );
forward.href = siteUrl;
forward.addEventListener("click", goForward, false);