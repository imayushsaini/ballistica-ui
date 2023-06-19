var fs = require("fs");

fs.copyFile(
  "dist/ballistica-web/index.html",
  "dist/ballistica-web/404.html",
  (err) => {
    console.error(err);
  }
);
