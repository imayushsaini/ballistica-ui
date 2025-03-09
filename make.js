var fs = require("fs");

require("dotenv").config({ path: "variables.env" });
const API = process.env.DEFAULT_API_PROXY;
const HOST = process.env.DEFAULT_HOST;

//updating vapid key
data = `export const environment = {
  production: false,
  API_PROXY: "$API",
  DEFAULT_HOST: "$HOST"
};`;
dev = "./src/environments/environment.ts";
prod = "./src/environments/environment.prod.ts";
var res = data.replace("$API", API);
var res = res.replace("$HOST", HOST);
fs.writeFile(dev, res, "utf8", (err) => {
  if (err) console.log(err);
});
res = res.replace("false", "true");
fs.writeFile(prod, res, "utf8", (err) => {
  if (err) console.log(err);
});
