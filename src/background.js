// background.js
chrome.runtime.onInstalled.addListener(function (details) {
  const reason = details.reason;
  switch (reason) {
    case "install":
      chrome.storage.local.set({ arcaPlus___isReload: false });
      chrome.storage.local.set({ arcaPlus___blockingEnabled: false });
      // 필요 시 설치 직후 안내 페이지 열기
      // chrome.tabs.create({ url: chrome.runtime.getURL("changelog/update.html") });
      break;
    case "update":
      // 업데이트 시 안내 페이지 열기
      // chrome.tabs.create({ url: chrome.runtime.getURL("changelog/update.html") });
      break;
    case "shared_module_update":
      break;
  }
});

// Declarative Net Request를 이용한 필터링(예시)
function updateRulesets() {
  chrome.storage.local.get(["arcaPlus___blockingEnabled"], (result) => {
    const isBlockingEnabled = result.arcaPlus___blockingEnabled !== false;
    // ruleset_1, ruleset_2가 있는 경우
    chrome.declarativeNetRequest.updateEnabledRulesets({
      enableRulesetIds: isBlockingEnabled ? ["ruleset_1", "ruleset_2"] : ["ruleset_2"],
      disableRulesetIds: isBlockingEnabled ? [] : ["ruleset_1"],
    });
  });
}

chrome.declarativeNetRequest.onRuleMatchedDebug.addListener((info) => {
  if (info.rule.rulesetId === "ruleset_1") {
    // block
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) {
        chrome.tabs.sendMessage(tabs[0].id, {
          type: "logBlock",
          url: info.request.url,
          ruleId: info.rule.ruleId,
          rule: JSON.stringify(info.rule),
        });
      }
    });
  } else if (info.rule.rulesetId === "ruleset_2") {
    // allow
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) {
        chrome.tabs.sendMessage(tabs[0].id, {
          type: "logAllow",
          url: info.request.url,
          ruleId: info.rule.ruleId,
          rule: JSON.stringify(info.rule),
        });
      }
    });
  }
});

// 스토리지 변경 감지 -> ruleset 갱신
chrome.storage.onChanged.addListener((changes, namespace) => {
  if ("arcaPlus___blockingEnabled" in changes) {
    updateRulesets();
  }
});