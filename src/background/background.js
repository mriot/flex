chrome.runtime.onInstalled.addListener(function() {
  /* ================================================= */
  const devWS = new WebSocket("ws://localhost:5522/dev");
  devWS.onmessage = (event) => {
    console.log("reloading...");
    if (event.data === "refresh") chrome.runtime.reload();
  };
  /* ================================================= */

  chrome.browserAction.setBadgeText({text: ""});
});

const STORE = new Store();

chrome.browserAction.onClicked.addListener((tab) => {
  const activeTab = STORE.get(tab);
  // console.log(activeTab);

  if (activeTab) {
    // todo: send message to content script for cleanup?
    chrome.browserAction.setBadgeText({text: "", tabId: tab.id});
    activeTab.connection.kill();
    STORE.remove(tab);

    if (STORE.getStoreSize() === 0) {
      console.log("no more active tabs");
      chrome.tabs.onUpdated.removeListener(tabUpdate);
    }

    console.log("DISABLED");
    return;
  }

  console.log("ENABLED");

  setUp(tab);

  const connection = new Connection(tab.id);
  connection.init();

  STORE.add({ connection, tab });
  
  chrome.tabs.onUpdated.addListener(tabUpdate);
});

/* 
  tabUpdate Listener
*/
function tabUpdate(tabId, changeInfo, tab) {
  if (tab.status !== "complete") return;
  console.log("NAVIGATED", tabId);
  
  const activeTab = STORE.get(tab);

  // navigated on a tab we have access to
  if (tab.url && activeTab) {
    setUp(tab, () => activeTab.connection.reinit());
  }
  
  // user navigated away
  if (!tab.url) {
    // kill connection if possible
    activeTab?.connection.kill();
    // remove activeTab since we no longer have access to it's page
    STORE.remove(tab);

    if (STORE.getStoreSize() === 0) {
      console.log("no more active tabs");
      chrome.tabs.onUpdated.removeListener(tabUpdate);
    }

    console.log("DISABLED");
  }
}

/* 
  setUp helper function
*/
function setUp(tab, cb = () => {}) {
  chrome.browserAction.setBadgeText({text: "✅", tabId: tab.id});
  // check if content script is already injected
  chrome.tabs.sendMessage(tab.id, { type: "ping" }, response => {
    // we don't mind if the receiving end doesn't exist
    if (chrome.runtime.lastError);

    if (!response) {
      console.log("injecting content script...");
      chrome.tabs.executeScript({ file: "/src/content/content.js" });
    }

    cb();
  });
}
