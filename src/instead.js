// http://stackoverflow.com/questions/901115/how-can-i-get-query-string-values-in-javascript
function getParameterByName(name) {
  name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
  var regex = new RegExp( "[\\?&]" + name + "=([^&#]*)" );
  results = regex.exec(location.search);
  return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}

var siteUrl = getParameterByName( "site" );

var domainRegex = new RegExp( "://([^/]+)" );
var matches = siteUrl.match( domainRegex );
var domain = matches[1];

var site = document.getElementById( "site" );
site.innerText = siteUrl;

function goForward() {

  chrome.storage.sync.get( "allowedUrls", function(data) {
    var updatedUrls = data.allowedUrls;
    if( updatedUrls === undefined ) {
      updatedUrls = {};
    }

    updatedUrls[domain] = {};

    chrome.storage.sync.set( { allowedUrls: updatedUrls }, function() {
      location.href = siteUrl;
    });

  });

  return false;
}

// TODO: Give them an hour on the site
var forward = document.getElementById( "forward" );
forward.onclick = "return false;";
forward.addEventListener("click", goForward, false);