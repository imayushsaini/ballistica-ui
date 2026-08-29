var fs = require("fs");

require("dotenv").config({ path: "variables.env" });
const API = process.env.DEFAULT_API_PROXY || "https://deno-prxy.bombsquad-community.deno.net";
const PROXIES_RAW = process.env.DEFAULT_API_PROXIES || API;
const PROXIES = Array.from(
  new Set(
    PROXIES_RAW.split(",")
      .map((s) => s.trim().replace(/\/+$/, ""))
      .filter(Boolean)
  )
);
if (!PROXIES.includes(API.trim().replace(/\/+$/, ""))) {
  PROXIES.unshift(API.trim().replace(/\/+$/, ""));
}
const HOST = process.env.DEFAULT_HOST || "127.0.0.1:43210";

const devData = `export const environment = {
  production: false,
  API_PROXY: ${JSON.stringify(API)},
  API_PROXIES: ${JSON.stringify(PROXIES)},
  DEFAULT_HOST: ${JSON.stringify(HOST)}
};
`;

const prodData = `export const environment = {
  production: true,
  API_PROXY: ${JSON.stringify(API)},
  API_PROXIES: ${JSON.stringify(PROXIES)},
  DEFAULT_HOST: ${JSON.stringify(HOST)}
};
`;

const dev = "./src/environments/environment.ts";
const prod = "./src/environments/environment.prod.ts";

fs.writeFile(dev, devData, "utf8", (err) => {
  if (err) console.log(err);
});
fs.writeFile(prod, prodData, "utf8", (err) => {
  if (err) console.log(err);
});

