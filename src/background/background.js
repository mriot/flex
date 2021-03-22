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

let STORE = [];

// listen for user interactions
chrome.browserAction.onClicked.addListener((tab) => {
  const current = STORE.find(s => s.tab.id === tab.id);
  // console.log(current);

  if (current) {
    // todo: send message to content script for cleanup?
    chrome.browserAction.setBadgeText({text: "", tabId: tab.id});
    current.connection.kill();
    STORE = STORE.filter(s => s.tab.id !== tab.id);

    if (STORE.length === 0) {
      console.log("all dead");
      chrome.tabs.onUpdated.removeListener(tabUpdate);
    }

    console.log("DISABLED");
    return;
  }

  console.log("ENABLED");

  setUp(tab);

  const connection = new Connection(tab.id);
  connection.init();

  STORE.push({ connection, tab });
  
  chrome.tabs.onUpdated.addListener(tabUpdate);
});

function tabUpdate(tabId, changeInfo, tab) {
  console.log("NAVIGATED", tabId, tab.id);
  if (tab.status !== "complete") return;
  
  const current = STORE.find(s => s.tab.id === tab.id);

  // navigated on a tab we have access to
  if (tab.url && current) {
    setUp(tab, () => current.connection.reinit());
  }
  
  // user navigated away
  if (!tab.url) {
    // remove current tab since we no longer have access to it's page
    STORE = STORE.filter(s => s.tab.id !== tab.id);

    if (STORE.length === 0) {
      console.log("all dead");
      chrome.tabs.onUpdated.removeListener(tabUpdate);
    }
  }
}

function setUp(tab, cb = () => {}) {
  chrome.browserAction.setBadgeText({text: "✅", tabId: tab.id});
  chrome.tabs.sendMessage(tab.id, { type: "ping" }, response => {
    // we don't mind if the receiving end doesn't exist
    if (chrome.runtime.lastError);

    if (!response) {
      console.log("injecting content script...");
      chrome.tabs.executeScript({file: "/src/content/content.js"});
    }

    cb(); // todo make prettier
  });
}
