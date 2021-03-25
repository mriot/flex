const gulp = require("gulp");
const ws = require("ws");

const wss = new ws.Server({ port: 5522, path: "/dev" });

wss.on("connection", (client) => console.log("Connected"));

const websocketTask = async () => {
  await wss.clients.forEach((client) => client.send("refresh"));
};

const defaultTask = async () => {
  await gulp.watch(["./addon/src/**/*"], gulp.series(websocketTask));
};

exports.default = defaultTask;
