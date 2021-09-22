var fs = require("fs");

require('dotenv').config({ path: 'variables.env' });
const publicVapidKey = process.env.PUBLIC_VAPID_KEY;
const serverName=process.env.SERVER_NAME;

//updating vapid key
data=`export const environment = {
  production: false,
  vapidKey:"$VAPID_KEY",
  serverName:"$SERVER_NAME"
};`
Path="./src/environments/environment.ts"
prod="./src/environments/environment.prod.ts"
var res=data.replace("$VAPID_KEY",publicVapidKey);
res=res.replace("$SERVER_NAME",serverName);
fs.writeFile(Path,res,'utf8',(err)=>{
       if(err) console.log(err);
})
res=res.replace('false','true');
fs.writeFile(prod,res,'utf8',(err)=>{
  if(err) console.log(err);
})
