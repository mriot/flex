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
    this.ws = new WebSocket("ws://localhost:3210/dev");

    this.ws.onopen = (event) => {
      console.log("✅ Socket connection to local dev server established");
    };
  
    this.ws.onclose = (event) => {
      console.log("ℹ️ Socket connection was terminated");
    };
  
    this.ws.onerror = (event) => {
      console.log("❌ Error with socket connection", event);
    };

    this.ws.onmessage = (event) => {
      this.data = JSON.parse(event.data);
      this.port = chrome.tabs.connect(this.tabId, {name: "knockknock"});
      this.port.postMessage(this.data);
    };
  }
}
