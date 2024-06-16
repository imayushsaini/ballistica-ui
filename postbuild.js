var fs = require("fs");

fs.copyFile(
  "dist/ballistica-web/browser/index.html",
  "dist/ballistica-web/browser/404.html",
  (err) => {
    console.error(err);
  }
);
