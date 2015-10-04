var insteadUrl = chrome.extension.getURL( "instead.html" );
var allowedUrls;
var blockedDomains;

chrome.storage.sync.get( ["allowedUrls", "blockedDomains"], function(data) {

  if( allowedUrls === undefined && data.allowedUrls !== undefined ) {
    allowedUrls = data.allowedUrls;
  }

  if( blockedDomains === undefined ) {
    if( data.blockedDomains !== undefined ) {
      blockedDomains = data.blockedDomains;
    } else {
      blockedDomains = {
        "facebook.com" : {},
        "www.lolcats.com" : {},
        "netflix.com" : {}
      };
    }
  }
});

chrome.storage.onChanged.addListener(function(changes, namespace) {
  if( changes.allowedUrls !== undefined ) {
    allowedUrls = changes.allowedUrls.newValue;
  }

  if( changes.blockedDomains !== undefined ) {
    blockedDomains = changes.allowedUrls.newValue;
  }
});

var domainRegex = new RegExp( "://([^/]+)" );

function shouldBlockUrl( url ) {
  var alreadyRedirected = url.indexOf( insteadUrl ) !== -1;
  if( alreadyRedirected ) {
    return false;
  }

  if( blockedDomains === undefined ) {
    return false;
  }

  var matches = url.match( domainRegex );
  var domain = matches[1];

  var block = blockedDomains[domain] !== undefined;
  if( !block ) {
    return false;
  }

  var now = new Date().valueOf();

  var data = allowedUrls && allowedUrls[domain];
  if( data !== undefined && data.timeoutMs !== undefined && now < data.timeoutMs ) {
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


/**
 * =============================================================================================================================================================
 * Search related functionality
 * =============================================================================================================================================================
 */

/**
 * If the search string hasn't changed, the keypress wasn't a character
 * but some form of navigation, so we can stop.
 *
 * @returns {boolean}
 */
function shouldSearch() {
  var str = $("#searchbox").val();
  return searchStr != str;
}

/**
 * Load all of the browser history and search it for the best matches
 *
 * @param searchStr
 * @param since
 */
function searchHistory(searchStr, since) {
  var doSearch = function(h) {
    renderTabs({
      history: searchTabArray(searchStr, h).slice(0, MAX_NON_TAB_RESULTS),
      type: "search"
    });
  };

  /**
   * compile the history filter regexp
   */
  var filterString = bg.getHistoryFilter().trim();
  var filterRegEx = filterString.length > 0 ? new RegExp(filterString) : null;

  /**
   * test each url against a regular expression to see if it should be included in the history search
   * https?:\/\/www\.(google|bing)\.(ca|com|co\.uk)\/(search|images)
   */
  var includeUrl = function(url) {
    return !filterRegEx || !filterRegEx.exec(url);
  };

  if(historyCache != null) {
    // use the cached values
    doSearch(historyCache);
  } else {
    // load browser history
    chrome.history.search({text: "", maxResults: 1000000000, startTime: since}, function(result) {

      var includeView = function(v) {
        return v.url && v.title && includeUrl(v.url)
      };

      historyCache = result.filter(includeView);

      log("loaded history for search", historyCache.length);

      doSearch(historyCache);
    })
  }
}

/**
 * Retrieve the search string from the search box and search the different tab groups following these rules:
 *
 * - if the search string starts or ends with 3 spaces ('   ') search the entire browser history
 * - if the search string starts or ends with 2 spaces ('  ') only search bookmarks
 * - if the search string starts or ends with 1 space (' ') search tabs and bookmarks
 * - otherwise search tabs unless there are less than 5 results in which case include bookmarks
 *
 */
function executeSearch() {

  if(!shouldSearch()) return;

  pageTimer.reset();

  // The user-entered value we're searching for
  searchStr = $('#searchbox').val();

  // Filter!
  var filteredTabs = [];
  var filteredClosed = [];
  var filteredBookmarks = [];

  if(searchStr.trim().length === 0) {
    // no need to search if the string is empty
    filteredTabs = bg.tabs;
    filteredClosed = bg.closedTabs;
  } else if(startsWith(searchStr, "   ") || endsWith(searchStr, "   ")) {
    //var since = new Date();
    ////since.setMonth(since.getMonth() - 1);
    //since.setDate(since.getDate() - 7);
    searchHistory(searchStr, 0);
    // i hate to break out of a function part way though but...
    return;
  } else if(startsWith(searchStr, "  ") || endsWith(searchStr, "  ")) {
    filteredBookmarks = searchTabArray(searchStr, bg.bookmarks);
  } else {
    filteredTabs = searchTabArray(searchStr, bg.tabs);
    filteredClosed = searchTabArray(searchStr, bg.closedTabs);
    var resultCount = filteredTabs.length + filteredClosed.length;
    if(startsWith(searchStr, " ") || endsWith(searchStr, " ") || resultCount < MIN_TAB_ONLY_RESULTS) {
      filteredBookmarks = searchTabArray(searchStr, bg.bookmarks);
    }
  }

  pageTimer.log("search completed for '" + searchStr + "'");

  // only show the top MAX_BOOKMARK_RESULTS bookmark hits.
  renderTabs({
    allTabs: filteredTabs,
    closedTabs: filteredClosed,
    bookmarks: filteredBookmarks.slice(0, MAX_NON_TAB_RESULTS),
    type: "search"
  });
}

function searchTabArray(searchStr, tabs) {
  var searchUrls = bg.showUrls() || bg.searchUrls();
  var options = {
    pre:  '{',
    post: '}',
    extract: function(element) {
      if (searchUrls) {
        return element.title + "~~" + element.url;
      } else {
        return element.title;
      }
    }
  };

  return fuzzy.filter(searchStr.trim(), tabs, options).map(function(entry) {
    var parts = entry.string.split(/~~/);
    // return a copy of the important fields for template rendering
    return {
      title: parts[0],
      displayUrl: parts[1],
      url: entry.original.url,
      id: entry.original.id,
      favIconUrl: entry.original.favIconUrl
    }
  });
}

/**
 * =============================================================================================================================================================
 * support functions etc
 * =============================================================================================================================================================
 */

function startsWith(str, start) {
  return str.lastIndexOf(start, 0) === 0;
}

function endsWith(str, end) {
  return str.indexOf(end, str.length - end.length) !== -1;
}
