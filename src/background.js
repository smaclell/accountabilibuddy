function shouldBlockUrl( url ) {
	var hasLol = url.indexOf( "lol" ) != -1;
  var alreadyRedirected = url.indexOf( "?site=" ) != -1;

  return !alreadyRedirected && hasLol;
}

chrome.webRequest.onBeforeRequest.addListener(
  function(details) {
    var block = shouldBlockUrl( details.url );
    if( block ) {
      return { redirectUrl: "http://google.com/?site="+details.url};
    } else {
      return {};
    }
  },
  {urls: ["<all_urls>"]},
  ["blocking"]
);