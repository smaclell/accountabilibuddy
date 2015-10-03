var insteadUrl = chrome.extension.getURL( "instead.html" );
var allowedUrls = {};

function noop() {}

chrome.storage.sync.get( "allowedUrls", function(data) {
  var remoteUrls = data.allowedUrls;
  if( remoteUrls === undefined ) {
    return;
  }

  allowedUrls = remoteUrls;

  chrome.storage.onChanged.addListener(function(changes, namespace) {
    var changedUrls = changes.allowedUrls
    if( changedUrls === undefined ) {
      return;
    }

    allowedUrls = changedUrls.newValue;
  });
});

var domainRegex = new RegExp( "://([^/]+)" );
var blockedDomains = {
  "facebook.com" : {},
  "www.lolcats.com" : {},
  "netflix.com" : {}
};

function shouldBlockUrl( url ) {
  var alreadyRedirected = url.indexOf( insteadUrl ) !== -1;
  if( alreadyRedirected ) {
    return false;
  }

  var matches = url.match( domainRegex );
  var domain = matches[1];

  var block = blockedDomains[domain] !== undefined;
  if( !block ) {
    return false;
  }

  var data = allowedUrls[domain];
  if( data !== undefined ) {
    return false;
  }

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