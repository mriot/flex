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
    switch (request.type) {
      case "ping":
        sendResponse("pong");   
        break;
    
      case "kill":
        window.location.reload();
        break;
      default:
        console.log("Unknown request type:", request.type);
    }
  });
  
  // ws connection to server
  chrome.storage.sync.get(storage => {
    const serverUrl = storage.wssUrl || "ws://localhost:3210/dev";
    const ws = new WebSocket(serverUrl);
  
    ws.onopen = () => {
      console.log("✅ Connected to local dev server");
    };
  
    ws.onclose = () => {
      console.log("ℹ️ Connection to local dev server ended");
    };
  
    ws.onerror = () => {
      console.log("❌ Could not connect to local dev server");
    };
  
    ws.onmessage = (event) => {
      try {
        handleData(JSON.parse(event.data));
      } catch (error) {
        console.log("❌ Could not parse JSON!", error);
      }
    };
  });
  
  function handleData(data) {
    if (data.debug) {
      console.log(data);
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

    switch (data.type) {
      case "css":
        if (!document.querySelector("#local_stylesheet")) {
          const styleTag = document.createElement("style");
          styleTag.setAttribute("id", "_flex_local_stylesheet");
          document.querySelector("body").appendChild(styleTag);
        }
  
        document.querySelector("#_flex_local_stylesheet").textContent = data.code;
        break;
    
      case "js": 
        if (document.querySelector("#_flex_local_script")) {
          window.location.reload();
          return;
        }

        const scriptTag = document.createElement("script");
        scriptTag.setAttribute("id", "_flex_local_script");
        scriptTag.textContent = data.code;
        document.querySelector("body").appendChild(scriptTag);
        break;

      default:
        console.log("Unknown data type:", data.type);
    }
  }
})();
