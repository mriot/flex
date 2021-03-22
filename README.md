# (WIP) FLEX - a flexible theming assistant

## Basic usage

1) Install this extension in your browser (tested in chrome but should run everywhere (maybe not IE or Edge))
2) Setup a local WebSocket server - e.g. use [gulp-ws-server](https://www.npmjs.com/package/gulp-ws-server)
3) Point the server at whatever URL you set in the extension's options page
   - Default is `ws://localhost:3210/dev`

## Extension API

To communicate from your project with the extension, you can use this simple API.  
Further down is a full example on how it could look like in a real project.

``` javascript
// Example of a JSON stringified object ready to be sent to the extension
const payload = JSON.stringify({
  type: "css",
  code: "body { color: red; }",
  removeNodes: [".selector", "link[href*='style.css']"]
})
```

| Key             | Type         | Values                       | Description                                                   |
|-----------------|--------------|------------------------------|---------------------------------------------------------------|
| type (required) | string       | css                          | Tells the extension what to do                                |
| code            | string       |                              | The code to be injected                                       |
| removeNodes     | string array | any valid css selector       | The extension will attempt to remove these nodes from the DOM |
| blockResources  | string array | any valid resource path      | Note: Not implemented yet                                     |
| debug           | bool         | true, false (default: false) | Note: Not implemented yet                                     |

## Example gulp setup

``` javascript
const gulp = require("gulp")
const ws = require("gulp-ws-server")
const fs = require("fs")

// create WebSocket server
const wss = ws({
  port: 3210,
  path: "/dev",
})

const websocketTask = async () => {
  // read css file contents
  const css = fs.readFileSync("./path/to/css/style.css", "utf8")

  // send message to client
  await wss.send(
    JSON.stringify({
      type: "css",
      code: css,
      removeNodes: ["link[href*='style.css']"] // any valid CSS selector
    })
  )
}

const defaultTask = async () => {
  await gulp.watch(
    ["awesome-theme/less/**/*.less"], // watch files
    { ignoreInitial: false },
    gulp.series(websocketTask) // execute websocketTask when files change
  )
}

// send stuff on initial connection to client
wss.on("connection", (event) => {
  websocketTask()
})

exports.default = defaultTask

```
