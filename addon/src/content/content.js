/* 
const config = {
  type: "css", // type of content/code
  code: "", // source code to be injected
  removeNodes: [".selector"], // nodes to be removed
  blockResources: [""], // network stuff
  debug: false // enable logging
};
*/

/*  */
chrome.runtime.onConnect.addListener(function(port) {
  // console.log(port);

  port.onMessage.addListener(function(message) {
    // console.log(message);

    switch (message.type) {
      case "ping":
        response("pong");
        break;
  
      case "css":
        if (!document.querySelector("#local_stylesheet")) {
          const styleTag = document.createElement("style");
          styleTag.setAttribute("id", "local_stylesheet");
          document.querySelector("head").appendChild(styleTag);
        }
  
        if (message.removeNodes?.length > 0) {
          message.removeNodes.forEach(element => {
            try {
              const node = document.querySelector(element);
              if (node && node.parentNode) node.parentNode.removeChild(node);
            } catch (error) {
              console.log("Could not remove element with selector", element, error);
            }
          });
        }
  
        document.querySelector("#local_stylesheet").innerHTML = message.code;
        break;
    
      default:
        console.log("lol bro wtf");
    }
  });
});
/*  */
