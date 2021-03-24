/* 
const config = {
  type: "css", // type of content/code
  code: "", // source code to be injected
  removeNodes: [".selector"], // nodes to be removed
  blockResources: [""], // network stuff
  debug: false // enable logging
};
*/

(function() {
  // check wether content script is already injected
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    sendResponse("pong");
  });
  
  // ws connection to server
  chrome.storage.sync.get(storage => {
    const url = storage.wssUrl || "ws://localhost:3210/dev";
    ws = new WebSocket(url);
  
    ws.onopen = (event) => {
      console.log("✅ Socket connection to local dev server established");
    };
  
    ws.onclose = (event) => {
      console.log("ℹ️ Socket connection was closed");
    };
  
    ws.onerror = (event) => {
      console.log("❌ Error with socket connection");
      chrome.browserAction.setBadgeText({text: "FAIL", tabId: tabId});
    };
  
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log(data);
      processRequest(data);
    };
  });
  
  function processRequest(data) {
    switch (data.type) {
      case "css":
        if (!document.querySelector("#local_stylesheet")) {
          const styleTag = document.createElement("style");
          styleTag.setAttribute("id", "local_stylesheet");
          document.querySelector("body").appendChild(styleTag);
        }
  
        if (data.removeNodes?.length > 0) {
          data.removeNodes.forEach(element => {
            try {
              const node = document.querySelector(element);
              if (node && node.parentNode) node.parentNode.removeChild(node);
            } catch (error) {
              console.log("Could not remove element with selector", element, error);
            }
          });
        }
  
        document.querySelector("#local_stylesheet").textContent = data.code;

        break;
    
      case "js": 
        if (document.querySelector("#local_script")) {
          console.log("reloading...");
          window.location.reload();
          return;
        }

        const scriptTag = document.createElement("script");
        scriptTag.setAttribute("id", "local_script");
        scriptTag.textContent = data.code;
        document.querySelector("body").appendChild(scriptTag);

        break;

      default:
        console.log("lol bro wtf", data.type);
    }
  }
})();


/*  * /
// say goodbye
window.onbeforeunload = function() {
  chrome.runtime.sendMessage("test", function(response) {
    console.log(response);
  });
}

chrome.runtime.onConnect.addListener(port => {
  console.log("connected to extension", port);

  port.onDisconnect.addListener(port => {
    // todo: cleanup (?)
    console.log("connection to extension terminated", port);
  });

  port.onMessage.addListener(message => {
    console.log(message);

    switch (message.type) {
      case "ping":
        response("pong");
        break;

      default:
        console.log("lol bro wtf");
    }
  });
});
/*  */
