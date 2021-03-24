chrome.runtime.onInstalled.addListener(() => {
  /* ================================================= */
  const devWS = new WebSocket("ws://localhost:5522/dev");
  devWS.onmessage = (event) => {
    console.log("reloading...");
    if (event.data === "refresh") chrome.runtime.reload();
  };
  /* ================================================= */
});

const STORE = new Store();

chrome.browserAction.onClicked.addListener(async (tab) => {
  const activeTab = STORE.get(tab);
  // console.log(activeTab);

  if (activeTab) {
    stop(tab);
    return;
  }

  injectContentScript(tab);

  STORE.add({ tab });
  
  chrome.tabs.onUpdated.addListener(tabUpdate);
  chrome.tabs.onRemoved.addListener(tabDelete);
  
  chrome.browserAction.setBadgeText({text: "✅", tabId: tab.id});
  console.log("ENABLED FOR CURRENT TAB");
});

/* 
  tabDelete Listener
*/
function tabDelete(tabId) {
  stop({ id: tabId }); // fake tab object since we only need the id here anyway
}

/* 
  tabUpdate Listener
*/
function tabUpdate(tabId, changeInfo, tab) {
  if (tab.status !== "complete") return;

  const activeTab = STORE.get(tab);

  if (!activeTab) return; // we're probably running on another tab (thus the listeners are active)

  // navigated on a tab we have access to (e.g. reload)
  if (tab.url) {
    injectContentScript(tab);
    chrome.browserAction.setBadgeText({ text: "✅", tabId: tab.id });
  } else {
    stop(tab); // user navigated away (other origin)
  }
}

/* 
  stop addon helper function
*/
function stop(tab) {
  STORE.remove(tab); // remove tab from store since we no longer have or want access to it
  chrome.browserAction.setBadgeText({ text: "", tabId: tab.id }, () => {
    if (chrome.runtime.lastError); // (╯°□°)╯︵ ┻━┻
  });
  console.log("STOPPED FOR CURRENT TAB");

  // if the addon is not running on any tabs - disable it entirely
  if (STORE.getStoreSize() === 0) {
    chrome.tabs.onUpdated.removeListener(tabUpdate);
    chrome.tabs.onRemoved.removeListener(tabDelete);
    console.log("ADDON SHUT DOWN");
  }
}

/* 
  injectContentScript helper function
*/
function injectContentScript(tab) {
  return new Promise((resolve, reject) => {
    // check if content script is already injected
    chrome.tabs.sendMessage(tab.id, { type: "ping" }, response => {
      // we don't mind if the receiving end doesn't exist
      if (chrome.runtime.lastError);

      if (!response) {
        console.log("injecting content script...");
        chrome.tabs.executeScript({ file: "/src/content/content.js" });
      }

      resolve();
    });
  });
}
