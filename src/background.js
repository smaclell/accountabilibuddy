var insteadUrl = chrome.extension.getURL( "instead.html" );
if( !localStorage.allowedUrls ) {
  localStorage.allowedUrls = "{}";
}

// Check for the block

function shouldBlockUrl( url ) {
  console.log( "Check " + url );

  var alreadyRedirected = url.indexOf( insteadUrl ) !== -1;
  if( alreadyRedirected ) {
    return false;
  }
  var hasLol = url.indexOf( "lol" ) !== -1;

  var block = hasLol;
  if( !block ) {
    console.log( "Good" );
    return false;
  }

  var allowedUrls = JSON.parse( localStorage.allowedUrls );
  var data = allowedUrls[url];
  console.log(data);
  if( data !== undefined ) {
    console.log( "Already allowed")
    return false;
  }

  console.log( "BLOCKED" );
  return true;
}

chrome.webRequest.onBeforeRequest.addListener(
  function(details) {
    var block = shouldBlockUrl( details.url );
    if( block ) {
      return { redirectUrl: insteadUrl + "?site=" + details.url };
    } else {
      return {};
    }
  },
  {urls: ["<all_urls>"]},
  ["blocking"]
);