const gulp = require("gulp");
const ws = require("gulp-ws-server");

const wss = ws({
  port: 5522,
  path: "/dev",
});

const websocketTask = async () => {
  await wss.send("refresh");
};

const defaultTask = async () => {
  await gulp.watch(["./src/**/*"], gulp.series(websocketTask));
};

exports.default = defaultTask;
