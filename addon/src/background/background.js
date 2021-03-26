/* ================================================= */
const devWS = new WebSocket("ws://localhost:5522/dev");
devWS.onmessage = (event) => {
  console.log("reloading...");
  if (event.data === "refresh") chrome.runtime.reload();
};
/* ================================================= */

chrome.runtime.onSuspend.addListener(function() {
  chrome.browserAction.setBadgeText({ text: "IDLE" });
});

chrome.browserAction.setBadgeText({ text: "" });

// tabs where FLEX is running are stored here
const STORE = new Store(); // gets purged when background page goes idle

chrome.browserAction.onClicked.addListener(async (tab) => {
  const activeTab = STORE.get(tab);
  // console.log(activeTab);

  if (activeTab) {
    stop(tab);
    return;
  }

  /**
   * NOTE: We're connecting to the content scripts to 
   * prevent chrome from suspending FLEX while its active.
   * Once all ports are closed (i.e. FLEX is not running on any tab),
   * chrome is allowed to suspend this background page.
   */
  chrome.runtime.onConnect.addListener((port) => {
    console.log("connected to content script", port);
  });

  injectContentScript(tab);

  STORE.add(tab);
  
  // the port connection above, allows us to add these listeners conditionally
  chrome.tabs.onUpdated.addListener(tabUpdate);
  chrome.tabs.onRemoved.addListener(tabDelete);
  
  chrome.browserAction.setBadgeText({ text: "✅", tabId: tab.id });
  console.log("ENABLED FOR " + tab.url);
});

/* 
  listener for tab deletion
*/
function tabDelete(tabId) {
  // fakeing tab object since we only need the id here anyway
  if (STORE.get({ id: tabId })) stop({ id: tabId });
}

/* 
  listener for tab updates (navigation, reload, ...)
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
  function to stop the addon on a specific tab
  or, if it's not running on any tab, fully shut it down 
*/
function stop(tab) {
  STORE.remove(tab); // remove tab from store since we no longer have or want access to it
  
  chrome.tabs.sendMessage(tab.id, { type: "kill" }, () => {
    if (chrome.runtime.lastError); // we don't mind if the receiving end doesn't exist
  });
  
  chrome.browserAction.setBadgeText({ text: "", tabId: tab.id }, () => {
    if (chrome.runtime.lastError); // (╯°□°)╯︵ ┻━┻
  });

  console.log("STOPPED FOR CURRENT TAB");

  // if the addon is not running on any tab - disable it entirely
  if (STORE.getSize() === 0) {
    chrome.tabs.onUpdated.removeListener(tabUpdate);
    chrome.tabs.onRemoved.removeListener(tabDelete);
    console.log("Everything is cleaned - ready for idle!");
  }
}

/* 
  function to inject the content script
*/
function injectContentScript(tab) {
  return new Promise((resolve, reject) => {
    // check if content script is already injected
    chrome.tabs.sendMessage(tab.id, { type: "ping" }, response => {
      if (chrome.runtime.lastError); // we don't mind if the receiving end doesn't exist...

      // ...that just means we have to inject the script first
      if (!response) {
        console.log("injecting content script...");
        chrome.tabs.executeScript(tab.id, { file: "/src/content/content.js" }, () => resolve());
        return;
      }

      resolve();
    });
  });
}
