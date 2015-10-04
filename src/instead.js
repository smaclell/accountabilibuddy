// http://stackoverflow.com/questions/901115/how-can-i-get-query-string-values-in-javascript
function getParameterByName(name) {
  name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
  var regex = new RegExp( "[\\?&]" + name + "=([^&#]*)" );
  results = regex.exec(location.search);
  return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}

var timeoutOffsetMs = 15 * 1000;

var siteUrl = getParameterByName( "site" );

var domainRegex = new RegExp( "://([^/]+)" );
var matches = siteUrl.match( domainRegex );
var domain = matches[1];

function goForward() {

  chrome.storage.sync.get( "allowances", function(data) {
    var allowances = data.allowances;
    if( allowances === undefined ) {
      allowances = {};
    }

    allowances.timeoutMs = new Date().valueOf() + timeoutOffsetMs;

    chrome.storage.sync.set( { allowances: allowances }, function() {
      location.href = siteUrl;
    });

  });

  return false;
}

var verses = [
  {
    text: "Because of the Lord's great love we are not consumed, for his compassions never fail",
    location: "Lamentations 3:22"
  },
  {
    text: "Above all else, guard your heart, for everything you do flow from it.",
    location: "Proverbs 4:23"
  },
  {
    text: "But each person is tempted when he is lured and enticed by his own desire.",
    location: "James 1:14"
  },
  {
    text: "I can do all things through him who strengthens me.",
    location: "Philippians 4:13"
  },
  {
    text: "Therefore, confess your sins to one another and pray for one another, that you might be healed. The prayer of a righteous person has great power as it is working.",
    location: "James 5:16"
  },
  {
    text: "Flee from sexual immorality. Every other sin a person commits is outside the body, but the sexually immoral person sins against his own body.",
    location: "1 Corinthians 6:18"
  },
  {
    text: "Therefore, my beloved, flee from idolatry.",
    location: "1 Corinthians 10:14"
  }
];

function delayedConfigureHtml() {
  var site = document.getElementById( "site" );
  site.innerText = siteUrl;

  var forward = document.getElementById( "forward" );
  forward.onclick = "return false;";
  forward.addEventListener("click", goForward, false);

  var verse = document.getElementById( "verse" );
  var verseNumber = Math.floor(Math.random() * verses.length);
  var verseData = verses[ verseNumber ];
  verse.innerHTML = "<span>" +
    verseData.text +
    "</span>" +
    " - " +
    "<a href=\"https://www.biblegateway.com/passage/?version=ESV&search=" +
    encodeURIComponent( verseData.location ) +
    "\">" +
    verseData.location +
    "</a>";
}

document.addEventListener("DOMContentLoaded", delayedConfigureHtml, false);
