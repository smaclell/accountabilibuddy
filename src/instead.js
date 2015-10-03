// http://stackoverflow.com/questions/901115/how-can-i-get-query-string-values-in-javascript
function getParameterByName(name) {
  name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
  var regex = new RegExp( "[\\?&]" + name + "=([^&#]*)" );
  results = regex.exec(location.search);
  return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}

var timeoutOffsetMs = 5 * 1000;

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

    updatedUrls[domain] = {
      timeoutMs: new Date().valueOf() + timeoutOffsetMs
    };

    chrome.storage.sync.set( { allowedUrls: updatedUrls }, function() {
      location.href = siteUrl;
    });

  });

  return false;
}

var forward = document.getElementById( "forward" );
forward.onclick = "return false;";
forward.addEventListener("click", goForward, false);