chrome.runtime.onInstalled.addListener(function (details) {
  const reason = details.reason;
  switch(reason) {
    case 'install':
      chrome.storage.local.set({isReload: true});
      break;
    case 'chrome_update': break;
    case 'shared_module_update': break;
  }
});