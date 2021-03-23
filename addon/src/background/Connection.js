/* class Connection {
  constructor(tabId) {
    this.tabId = tabId;
  }
  
  reinit() {
    this.kill();
    this.init();
  }

  kill() {
    this.ws.close();
    this.port.disconnect();
  }

  init() {
    return new Promise((resolve, reject) => {
      chrome.storage.sync.get(storage => {
        const url = storage.wssUrl || "ws://localhost:3210/dev";
        this.ws = new WebSocket(url);

        this.ws.onopen = (event) => {
          console.log("✅ Socket connection to local dev server established");
          this.port = chrome.tabs.connect(this.tabId, {name: "flex"});
          resolve(true);
        };
      
        this.ws.onclose = (event) => {
          console.log("ℹ️ Socket connection was closed");
          this.port?.disconnect();
        };
      
        this.ws.onerror = (event) => {
          console.log("❌ Error with socket connection");
          chrome.browserAction.setBadgeText({text: "FAIL", tabId: this.tabId});
          resolve(false);
        };
    
        this.ws.onmessage = (event) => {
          this.data = JSON.parse(event.data);
          this.port.postMessage(this.data);
        };
      });
    });
  }
}
 */
