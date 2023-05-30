const Discord = require("discord.js");
const client = new Discord.Client();
var request = require("request");
var fs = require("fs");
var subscribers = require("../subscribers/discordSubscribers.json");
var players = require("../subscribers/players.json");
require("dotenv").config({ path: "variables.env" });

var channelId = process.env.DISCORD_LIVE_CHANNELID; //channel that will show live stats

var botMsgIds = [];
var leaderboard = {};
try {
  client.login(process.env.DISCORD_BOT_TOKEN);
} catch (ex) {
  console.log("Invalid Discord Token provided");
}

client.on("ready", () => {
  console.log(`Logged in as ${client.user.tag}!`);
  channel = client.channels.cache.get(channelId);
  verifyChannel(channel); //get id of msg posted by bot , or send new msg if not present
  //setInterval(()=>{updatestats()},10000)
});

client.on("message", (msg) => {
  if (!msg.content.includes(" ")) return;
  command = msg.content.split(" ")[0];
  arg = msg.content.split(" ")[1];
  if (command == "subscribe") {
    let res = searchId(arg);
    if (res) {
      let sub = {
        id: msg.author.id,
        usertag: msg.author.username,
      };
      subscribe(
        msg,
        sub,
        res["aid"],
        res["name_html"].replace(/<\/?[^>]+(>|$)/g, "")
      );
    } else {
      msg.reply("Id not found");
    }
  } else if (command == "unsubscribe") {
    msg.reply(`you unsubscribed from ${arg}`);
  } else if (command == "search") {
    res = searchId(arg);
    if (!res) {
      msg.reply("not found");
      return;
    }
    messag = `\n ${res["name_html"].replace(/<\/?[^>]+(>|$)/g, "")} \n ID : ${
      res["aid"]
    } \n Rank:${res["rank"]} \n Score:${res["scores"]}\n Kills :${
      res["kills"]
    } \n Deaths ${res["deaths"]}\n Games:${
      res["games"]
    } \n Last Seen:${new Date(res["last_seen"])}`;
    msg.reply(messag);
  }
});

function searchId(key) {
  if (arg.startsWith("pb-")) {
    if (leaderboard[arg]) {
      return leaderboard[arg];
    }
  } else {
    let f = Object.keys(leaderboard).find((key) => {
      if (
        leaderboard[key].name_html.toLowerCase().includes(arg.toLowerCase())
      ) {
        return leaderboard[key];
      }
    });
    if (f) {
      return leaderboard[f];
    } else {
      return null;
    }
  }
}

function saveSubscription() {
  fs.writeFile(
    "./subscribers/discordSubscribers.json",
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
  console.log("saved");
}

function getSubscriberId(sub) {
  isExists = false;
  id = "";
  Object.entries(subscribers).map((entry) => {
    let key = entry[0];
    let value = entry[1];
    if (value["id"] == sub["id"]) {
      isExists = true;
      id = key; // return from .map function not working, need to optimize later when handling huge data
    }
  });
  if (!isExists) {
    id = generateId(6);
    subscribers[id] = sub;
  }

  return id;
}

function subscribe(msg, sub, player_id, name) {
  var id = getSubscriberId(sub);
  if (id) {
    if (player_id in players) {
      if (!players[player_id]["discord"].includes(id)) {
        players[player_id]["discord"].push(id);
      }
    } else {
      players[player_id] = {
        webpush: [],
        discord: [id],
        last_seen: new Date(),
        name: name,
      };
    }
    msg.reply(`Subscribed to ${name}.`);
    dmmsg = `This is a conformation that you Subscribed to ${name} and your DMs are open ! \n
              hope you would catchup your friend :)`;
    client.users
      .fetch(msg.author.id)
      .then((user) => {
        user.send(dmmsg);
      })
      .catch((error) => {});
  }
  saveSubscription();
  //sendPush(sub,player_id,name);
}

function verifyChannel(channel) {
  var msgCount = 0;
  channel.messages.fetch({ limit: 10 }).then((messages) => {
    messages.forEach((message) => {
      if (message.author.id == client.user.id) {
        msgCount++;
        botMsgIds.push(message.id);
      }
    });
    botMsgIds.reverse();
    while (msgCount < 2) {
      channel.send("msg reserved for live stats" + msgCount).then((mssg) => {
        botMsgIds.push(mssg.id);
      });
      msgCount++;
    }
  });
}

function updateStats(stats) {
  if (Object.keys(stats).length == 0) return;
  liveplayers = stats["roster"];
  livechat = stats["chats"];
  cpu = stats["system"]["cpu"];
  ram = stats["system"]["ram"];
  // Live Stats Message ============================
  msg1 = ` **Live stats | ${process.env.SERVER_NAME}** \n \n CPU ${cpu}% ram ${ram}% \n\n`;
  msg2 = "```";
  for (player in liveplayers) {
    msg2 =
      msg2 +
      liveplayers[player]["device_id"] +
      " ==>" +
      liveplayers[player]["name"] +
      "\n";
  }
  map = `\n **Current Map:** ${stats["playlist"]["current"]} \n **Next Map:** ${stats["playlist"]["next"]} \n`;
  client.channels.cache
    .get(channelId)
    .messages.fetch(botMsgIds[0])
    .then((msg) => {
      msg.edit(msg1 + msg2 + "```" + map);
    });
  // Live Chat Message =======================
  msg3 = "**LIVE CHAT** ```";
  for (m in livechat) {
    msg3 = msg3 + livechat[m] + "\n";
  }
  client.channels.cache
    .get(channelId)
    .messages.fetch(botMsgIds[1])
    .then((msg) => {
      msg.edit(msg3 + "```");
    });
}

function notifyFor(player_id) {
  if (player_id in players) {
    for (sub_id in players[player_id]["discord"]) {
      if (players[player_id]["discord"][sub_id] in subscribers) {
        sendNotification(
          subscribers[players[player_id]["discord"][sub_id]]["id"],
          players[player_id]["name"]
        );
      }
    }
  }
}

function sendNotification(to, name) {
  msg = `${name} is now playing in ${process.env.SERVER_NAME} Server`;
  client.users
    .fetch(to)
    .then((user) => {
      user.send(msg);
    })
    .catch((error) => {});
}

function updateLeaderboard(data) {
  leaderboard = data;
  // update discord leaderboard msg with top 5 players
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
  updateLeaderboard: updateLeaderboard,
  updateStats: updateStats,
  notifyFor: notifyFor,
};
