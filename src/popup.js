'use strict';

function updateList () {
  var form = document.getElementById('removeBlockedDomain')
  var dataList = document.getElementById('patterns');
  chrome.storage.sync.get('blockedDomains', function (data) {
    var blockedDomains = data.blockedDomains;
    if( blockedDomains === undefined || !blockedDomains.length ) {
      return;
    }

    while (dataList.hasChildNodes()) {
      dataList.removeChild(dataList.firstChild);
    }

    var first = true;
    for (var domain of blockedDomains) {
      var option = document.createElement('OPTION');
      option.value = domain.pattern;
      dataList.appendChild(option);
    }

    form.pattern.value = blockedDomains[0].pattern;
  });
}

function loadForm () {
  var form = document.getElementById('addBlockedDomain');
  form.addEventListener('submit', onSubmitAdd);

  var removeForm = document.getElementById('removeBlockedDomain');
  removeForm.addEventListener('submit', onSubmitRemove);
}

function onSubmitAdd (evt) {
  evt.preventDefault();
  var form = evt.target;

  chrome.storage.sync.get('blockedDomains', function (data) {
    var updatedDomains = data.blockedDomains;
    if( updatedDomains === undefined ) {
      updatedDomains = [];
    }

    updatedDomains.push({
      pattern: form.pattern.value
    });
    form.pattern.value = '';

    chrome.storage.sync.set( { blockedDomains: updatedDomains }, updateList);
  });
}

function onSubmitRemove (evt) {
  evt.preventDefault();
  var form = evt.target;

  chrome.storage.sync.get('blockedDomains', function (data) {
    var updatedDomains = data.blockedDomains;
    if( updatedDomains === undefined ) {
      return;
    }

    var index = updatedDomains.findIndex(function (domain) {
      return domain.pattern === form.pattern.value;
    });
    if (index >= 0) {
      updatedDomains.splice(index, 1);
    }

    chrome.storage.sync.set( { blockedDomains: updatedDomains }, updateList);
  });
}

loadForm();
updateList();
