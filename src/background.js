chrome.runtime.onInstalled.addListener(function (details) {
  const reason = details.reason;
  switch(reason) {
    case 'install':
      chrome.storage.local.set({isReload: true});
      chrome.tabs.create({
        url: chrome.runtime.getURL("changelog/update.html"),
      });
      break;
      case 'update':
        chrome.tabs.create({
          url: chrome.runtime.getURL("changelog/update.html"),
        });
    case 'shared_module_update': break;
  }
});