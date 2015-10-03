var insteadUrl = chrome.extension.getURL( "instead.html" );
var allowedUrls = {};

function noop() {}

chrome.storage.sync.get( "allowedUrls", function(data) {
  var remoteUrls = data.allowedUrls;
  if( remoteUrls === undefined ) {
    chrome.storage.sync.set( { allowedUrls: allowedUrls }, noop);
    return;
  }

  for(var url in remoteUrls ) {
    allowedUrls[url] = remoteUrls[url];
  }
});

chrome.storage.onChanged.addListener(function(changes, namespace) {
  var changedUrls = changes.allowedUrls
  if( changedUrls === undefined ) {
    return;
  }

  changedUrls = changedUrls.newValue;
  if( changedUrls === undefined ) {
    return;
  }

  for(var url in changedUrls) {
    var data = changedUrls[url];
    allowedUrls[url] = data;

    // TODO: What about aging things out? Removed items?
    // TODO: Version the data in the urls to prevent races
    /*
    var localData = allowedUrls[url];
    if( localData === undefined || ) {
      allowedUrls[url] = data;
    } else if( localData.version < data.version ) {
      allowedUrls[url] = data;
    }
    */
  }

});


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

  var data = allowedUrls[url];
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
  {
    urls: ["<all_urls>"],
    types: ["main_frame", "sub_frame", "image"]
  },
  ["blocking"]
);