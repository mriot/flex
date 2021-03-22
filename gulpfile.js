const gulp = require("gulp");
const rename = require("gulp-rename");
const less = require("gulp-less");
const beautifier = require("gulp-jsbeautifier");
const ws = require("gulp-ws-server");
const fs = require("fs");

const wss = ws({
  port: 5522,
  path: "/dev",
});

const websocketTask = async () => {
  await wss.send("refresh");
};

const defaultTask = async () => {
  await gulp.watch(["./src/*"], gulp.series(websocketTask));
};

exports.default = defaultTask;
