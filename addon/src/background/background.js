chrome.runtime.onInstalled.addListener(() => {
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

chrome.browserAction.onClicked.addListener(async (tab) => {
  const activeTab = STORE.get(tab);
  // console.log(activeTab);

  if (activeTab) {
    chrome.browserAction.setBadgeText({text: "", tabId: tab.id});
    activeTab.connection.kill();
    STORE.remove(tab);

    if (STORE.getStoreSize() === 0) {
      console.log("no more active tabs");
      chrome.tabs.onUpdated.removeListener(tabUpdate);
    }

    console.log("DISABLED FOR CURRENT TAB");
    return;
  }

  await injectContentScript(tab);

  const connection = new Connection(tab.id);
  const connected = await connection.init();

  if (!connected) {
    chrome.browserAction.setBadgeText({text: "FAIL", tabId: tab.id});
    return;
  }

  STORE.add({ connection, tab });

  chrome.tabs.onUpdated.addListener(tabUpdate);
  
  chrome.browserAction.setBadgeText({text: "✅", tabId: tab.id});
  console.log("ENABLED FOR CURRENT TAB");
});

/* 
  tabUpdate Listener
*/
async function tabUpdate(tabId, changeInfo, tab) {
  if (tab.status !== "complete") return;
  // console.log("NAVIGATED", tabId);
  
  const activeTab = STORE.get(tab);

  // navigated on a tab we have access to (e.g. reload)
  if (tab.url && activeTab) {
    await injectContentScript(tab);
    activeTab.connection.reinit();
    chrome.browserAction.setBadgeText({text: "✅", tabId: tab.id});
  }
  
  // user navigated away (other origin)
  if (!tab.url) {
    // kill connection if possible
    activeTab?.connection.kill();
    // remove activeTab since we no longer have access to it's page
    STORE.remove(tab);

    if (STORE.getStoreSize() === 0) {
      console.log("no more active tabs");
      chrome.tabs.onUpdated.removeListener(tabUpdate);
    }

    console.log("DISABLED FOR CURRENT TAB");
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
