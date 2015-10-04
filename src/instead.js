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
      chrome.runtime.sendMessage('update', function () {
        location.href = siteUrl;
      });
    });

  });

  return false;
}

var verses = [
  "Because of the Lord's great love we are not consumed, for his compassions never fail <em>Lamentations 3:22</em>",
  "Above all else, guard your heart, for everything you do flow from it. <em>Proverbs 4:23</em>"
];

function delayedConfigureHtml() {
  var site = document.getElementById( "site" );
  site.innerText = siteUrl;

  var forward = document.getElementById( "forward" );
  forward.onclick = "return false;";
  forward.addEventListener("click", goForward, false);

  var verse = document.getElementById( "verse" );
  var lazyRand = (new Date().valueOf()) % verses.length;
  verse.innerHTML = verses[ lazyRand ];
}

document.addEventListener("DOMContentLoaded", delayedConfigureHtml, false);
