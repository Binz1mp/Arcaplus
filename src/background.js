chrome.runtime.onInstalled.addListener(function (details) {
  const reason = details.reason;
  switch(reason) {
    case 'install':
      chrome.storage.local.set({arcaPlus___isReload: false});
      chrome.storage.local.set({arcaPlus___blockingEnabled: false});
      // chrome.tabs.create({
      //   url: chrome.runtime.getURL("changelog/update.html"),
      // });
      break;
      case 'update':
        // chrome.tabs.create({
        //   url: chrome.runtime.getURL("changelog/update.html"),
        // });
    case 'shared_module_update': break;
  }
});
function updateRulesets() {
  chrome.storage.local.get(['arcaPlus___blockingEnabled'], (result) => {
    const isBlockingEnabled = result.arcaPlus___blockingEnabled !== false;
    chrome.declarativeNetRequest.updateEnabledRulesets({
      enableRulesetIds: isBlockingEnabled ? ['ruleset_1', 'ruleset_2'] : ['ruleset_2'],
      disableRulesetIds: isBlockingEnabled ? [] : ['ruleset_1']
    });
  });
}

chrome.declarativeNetRequest.onRuleMatchedDebug.addListener((info) => {
  if (info.rule.rulesetId == 'ruleset_1') { // block
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) {
        chrome.tabs.sendMessage(tabs[0].id, {
          type: 'logBlock',
          url: info.request.url,
          ruleId: info.rule.ruleId,
          rule: JSON.stringify(info.rule)
        });
      }
    });
  } else if (info.rule.rulesetId == 'ruleset_2') { // allow
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) {
        chrome.tabs.sendMessage(tabs[0].id, {
          type: 'logAllow',
          url: info.request.url,
          ruleId: info.rule.ruleId,
          rule: JSON.stringify(info.rule)
        });
      }
    });
  }
});

chrome.storage.onChanged.addListener((changes, namespace) => {
  if ('arcaPlus___blockingEnabled' in changes) {
    updateRulesets();
  }
});