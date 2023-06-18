var fs = require("fs");

require("dotenv").config({ path: "variables.env" });
const IP = process.env.SERVER_IP;
const PORT = process.env.SERVER_PORT;

//updating vapid key
data = `export const environment = {
  production: false,
  API_ENDPOINT: "$API"
};`;
dev = "./src/environments/environment.ts";
prod = "./src/environments/environment.prod.ts";
var res = data.replace("$API", `http://${IP.trim()}:${PORT.trim()}`);
fs.writeFile(dev, res, "utf8", (err) => {
  if (err) console.log(err);
});
res = res.replace("false", "true");
fs.writeFile(prod, res, "utf8", (err) => {
  if (err) console.log(err);
});
