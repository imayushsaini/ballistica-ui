require("dotenv").config({ path: "variables.env" });
const webPush = require("web-push");
var subscribers = require("../subscribers/webSubscribers.json");
var players = require("../subscribers/players.json");
const publicVapidKey = process.env.PUBLIC_VAPID_KEY;
const privateVapidKey = process.env.PRIVATE_VAPID_KEY;
var fs = require("fs");
webPush.setVapidDetails(
  `mailto:${process.env.EMAIL}`,
  publicVapidKey,
  privateVapidKey
);

function subscribe(sub, player_id, name) {
  var id = getSubscriberId(sub);
  if (id) {
    if (player_id in players) {
      if (!players[player_id]["webpush"].includes(id)) {
        players[player_id]["webpush"].push(id);
      }
    } else {
      players[player_id] = {
        webpush: [id],
        discord: [],
        last_seen: new Date(),
        name: name,
      };
    }
  }
  saveSubscription();
  sendConformation(sub, player_id, name);
}

function getSubscriberId(sub) {
  isExists = false;
  id = "";
  Object.entries(subscribers).map((entry) => {
    let key = entry[0];
    let value = entry[1];
    if (value["endpoint"] == sub["endpoint"]) {
      isExists = true;
      id = key; //wont return from .map function , need to optimize later when handling huge data
    }
  });
  if (!isExists) {
    id = generateId(6);
    subscribers[id] = sub;
  }

  return id;
}

function saveSubscription() {
  fs.writeFile(
    "./subscribers/webSubscribers.json",
    JSON.stringify(subscribers, null, 4),
    function (err) {
      console.log(err);
    }
  );
  fs.writeFile(
    "./subscribers/players.json",
    JSON.stringify(players, null, 4),
    function (err) {
      console.log(err);
    }
  );
}

function sendPush(subscription, player_id, name) {
  payload = JSON.stringify({
    notification: {
      title: name + " is playing now !",
      body: `Join ${process.env.SERVER_NAME} server ${name} is waiting for you `,
      icon: "assets/icons/icon-96x96.png",
      vibrate: [100, 50, 100],
      requireInteraction: true,
      data: { dateOfArrival: Date.now() },
      actions: [{ action: "nothing", title: "Launch Bombsquad" }], //need to send link of the web app
    },
  });
  webPush.sendNotification(subscription, payload).catch((error) => {}); // lets not spam console right now , will handle expired/unsubscribed   errors later
}

function sendConformation(subscription, player_id, name) {
  payload = JSON.stringify({
    notification: {
      title: `Successfully subscribed to ${name} !`,
      body: `Notification working fine `,
      icon: "assets/icons/icon-96x96.png",
      vibrate: [100, 50, 100],
      requireInteraction: true,
      data: { dateOfArrival: Date.now() },
      actions: [{ action: "nothing", title: "Launch Bombsquad" }], //need to send link of the web app
    },
  });
  webPush.sendNotification(subscription, payload).catch((error) => {}); // lets not spam console right now , will handle expired/unsubscribed   errors later
}

function notifyFor(player_id) {
  if (player_id in players) {
    for (sub_id in players[player_id]["webpush"]) {
      if (players[player_id]["webpush"][sub_id] in subscribers) {
        sendPush(
          subscribers[players[player_id]["webpush"][sub_id]],
          player_id,
          players[player_id]["name"]
        ); //player_id need to be change with Player name(for payload only) , later
      }
    }
  }
}

function generateId(length) {
  var result = "";
  var characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  var charactersLength = characters.length;
  for (var i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

module.exports = {
  subscribe: subscribe,
  notifyFor: notifyFor,
};
