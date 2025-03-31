var fs = require("fs");

fs.copyFile(
  "dist/server-manager/browser/index.html",
  "dist/server-manager/browser/404.html",
  (err) => {
    console.error(err);
  }
);
