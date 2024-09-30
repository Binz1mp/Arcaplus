const popcatImg = document.getElementsByClassName('popcat');
var popcatsfx = chrome.runtime.getURL('sfx/popcat.mp3');
var poppop = new Audio(popcatsfx);

for (i = 0; i < popcatImg.length; i++) {
  popcatImg[i].addEventListener('click', function () {
    poppop.play();
    console.log('pop');
  });
}




document.addEventListener('DOMContentLoaded', function() {
  const toggleBlocking = document.getElementById('toggle-blocking');

  // Load initial state
  chrome.storage.local.get(['arcaPlus___blockingEnabled'], function(result) {
      toggleBlocking.checked = result.arcaPlus___blockingEnabled !== false;
  });

  // Update storage and rules when checkbox is toggled
  toggleBlocking.addEventListener('change', function() {
      const isEnabled = this.checked;
      chrome.storage.local.set({arcaPlus___blockingEnabled: isEnabled}, function() {
          chrome.declarativeNetRequest.updateEnabledRulesets({
              enableRulesetIds: isEnabled ? ['ruleset_1'] : [],
              disableRulesetIds: isEnabled ? [] : ['ruleset_1']
          });
      });
  });
});