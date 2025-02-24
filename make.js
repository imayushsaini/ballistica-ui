var fs = require("fs");

require("dotenv").config({ path: "variables.env" });
const API = process.env.API_PROXY;
const HOST = process.env.HOST;

//updating vapid key
data = `export const environment = {
  production: false,
  API_PROXY: "$API",
  HOST: "$HOST"
};`;
dev = "./src/environments/environment.ts";
prod = "./src/environments/environment.prod.ts";
var res = data.replace("$API", API);
var res = data.replace("$HOST", HOST);
fs.writeFile(dev, res, "utf8", (err) => {
  if (err) console.log(err);
});
res = res.replace("false", "true");
fs.writeFile(prod, res, "utf8", (err) => {
  if (err) console.log(err);
});
