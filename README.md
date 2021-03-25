# FLEX 💪 a flexible theming assistant (WIP)

![GitHub](https://img.shields.io/github/license/mriot/flex)
![GitHub](https://img.shields.io/badge/version-0.0.1_(WIP)-lightgrey)

## A simple browser extension to inject your code on the fly.  

### It does not require any special permission and does nothing until you grant access to the current page by pressing its icon.

## Table of Contents

- [Basic usage](#-basic-usage)
- [Important](#-important)
- [Use cases](#-use-cases)
- [Extension API](#-extension-api)
- [How it works](#-how-it-works)
- [Example gulp setup](#-example-gulp-setup)
- [Troubleshooting](#️-troubleshooting)
- [Development](#-development)
- [Contributing](#-contributing)
- [Support](#-support)
- [Disclaimer](#️-disclaimer)

## 📝 Basic usage

1) Install the extension in your browser (tested in chrome but should also run in firefox)  
2) Set up a local websocket server - e.g. use Node.js with the [ws package](https://www.npmjs.com/package/ws)
3) Point the server at whatever URL you set in the extension's options page
   - Default is `ws://localhost:3210/dev`
4) Further information can be found in the [Development section](#-development)

## 📌 Use cases

1) You'll possibly find one or two 😄
2) I do a lot of frontend stuff for our company's WordPress sites and it can become cumbersome to copy & paste the code and reload the page over and over again

## 🧩 Extension API

Communication between your project and the extension is made via websockets.  
You can use the following API to tell the extension what you want to do:

``` javascript
{
  type: "css", // we want to inject css code
  code: "body { color: red; }",
  removeNodes: [".selector", "link[href*='style.css']"] // we also want to remove these nodes from the DOM
}
```

| Key             | Type         | Values                       | Description                                                                        |
|-----------------|--------------|------------------------------|------------------------------------------------------------------------------------|
| type            | string       | css, js                      | Tells the extension what to do.<br>CSS will be updated without reloading the site. |
| code            | string       |                              | The code to be injected                                                            |
| removeNodes     | string array | any valid css selector       | The extension will attempt to remove these nodes from the DOM                      |
| blockResources  | string array | any valid resource path      | Note: Not implemented yet                                                          |
| debug           | bool         | true, false (default: false) | Log data received by the client to the browser console                             |

## 🤔 How it works

Upon activation, the extension injects a small script into the website's context.  
This script is what connects your project with the webpage.  

Now, whenever your websocket server is sending something, FLEX will try to understand that request and for example, remove nodes from the DOM and inject some CSS.  
*Tip: Often you can use the node-removal-feature to remove the original CSS resource and thus fully replace it with your local file*

## 🧾 Example gulp setup

``` javascript
const gulp = require("gulp");
const fs = require("fs");
const less = require("gulp-less");
const ws = require("ws");

// create a websocket server - default port and path
const wss = new ws.Server({ port: 3210, path: "/dev" });

// add a new method to the server object to "broadcast" to all clients
wss.send = (data) => {
  wss.clients.forEach((client) => client.send(data));
};

// deliver code on initial connection with a client
wss.on("connection", (client) => {
  console.log("Client connected");
  // pass the freshly connected client as target
  handleJS(client);
  handleLESS(client);
});

// do your javascript stuff
const handleJS = (target) => {
  const js = fs.readFileSync("./src/script.js", "utf8");
  target.send(JSON.stringify({ type: "js", code: js }));
};

// do your less/sass/css/etc stuff
const handleLESS = (target) => {
  gulp
    .src("src/*.less")
    .pipe(less())
    .pipe(gulp.dest("src/"))
    .on("end", () => {
      // once transpiled, read the css file and send it to the client(s)
      const css = fs.readFileSync("./src/style.css", "utf8");
      target.send(JSON.stringify({ type: "css", code: css }));
    });
};

// file watcher - runs tasks whenever files change
const defaultTask = () => {
  // broadcast changes to all clients by passing 'wss' as target (this is the server object)
  gulp.watch(["src/*.js"], { ignoreInitial: false }, function js() { return handleJS(wss); });
  gulp.watch(["src/*.less"], { ignoreInitial: false }, function less() { return handleLESS(wss); });
};

exports.default = defaultTask;

```

## 🤷‍♂️ Troubleshooting

Always start your websocket server **first**. Upon activation the extension will immediately attempt to connect to your server **once**.  
Usually a simple page reload fixes all connection issues.

If that does not resolve your problem, restart your server and the extension or even try reinstalling it.  
Of course you can always check the devtools, either in the background page or in the page itself.

## 💻 Development

After checking out the repo, you have to decide if you just want to work with the files in `addon/` of if you want to use a nice dev workflow.  
If you go with the last, Node.js is required.

Install the extension in your browser by activating the devmode in `chrome://extensions/` and pressing `Load unpacked`. Locate the `addon/` directory from this project and you're done.

![extensions page devmode](images/extensions-page-devmode.jpg)

### Using the workflow

With Node.js installed, open up a terminal in the project's root directory and run `npm install`.  
After completion run `gulp`.  

Go to `chrome://extensions/` and press the reload button on the extension.  
Your terminal should show `Connected`.

Now, whenever you edit a file within `addon/`, the extension will get automatically reloaded in the browser.

**Note: Sometimes the extension goes into idle mode. To resolve this, simply click on the "background page" link which will open a devtools window. Keep it open.**  
That will prevent your extension from becoming idle while in dev mode.

![inactive background page](images/flex-background-inactive.jpg)

Happy coding! 🍻

## 🤝 Contributing

Feel free to contribute in any way. If I see an improvement for this tool, I'd be glad to add it.

## 🆘 Support

If you experience any problems, contact me or open an issue.  
I will try to respond asap.

## ⚖️ Disclaimer

There's no warranty, liability whatsoever.
