class Connection {
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
      // todo: get adress from settings
      this.ws = new WebSocket("ws://localhost:3210/dev");
      
      this.ws.onopen = (event) => {
        console.log("✅ Socket connection to local dev server established");
        this.port = chrome.tabs.connect(this.tabId, {name: "flex"});
        resolve(true);
      };
    
      this.ws.onclose = (event) => {
        console.log("ℹ️ Socket connection was closed");
        this.port.disconnect();
      };
    
      this.ws.onerror = (event) => {
        console.log("❌ Error with socket connection");
        resolve(false);
      };
  
      this.ws.onmessage = (event) => {
        this.data = JSON.parse(event.data);
        this.port.postMessage(this.data);
      };
    })
  }
}
