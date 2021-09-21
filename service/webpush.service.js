require('dotenv').config({ path: 'variables.env' });
const webPush = require('web-push');
var subscribers=require('../subscribers/webSubscribers.json');
var players=require('../subscribers/players.json');
const publicVapidKey = process.env.PUBLIC_VAPID_KEY;
const privateVapidKey = process.env.PRIVATE_VAPID_KEY;
var fs=require('fs');
webPush.setVapidDetails(
      	'mailto:heysmoothy@gmail.com',
      	 publicVapidKey,
      	 privateVapidKey
      	);

function subscribe(sub,player_id,name){
	var id=subscriberExists(sub);
	console.log("called for function"+id);
	if(id){
		console.log("checking id"+id);
		if(player_id in players){
			if (! (players[player_id]['webpush'].includes(id))){
				console.log("id:"+id+"not a subscriber push it")
				players[player_id]['webpush'].push(id)
			}
		}else{
			players[player_id]={"webpush":[id],"discord":[],"last_seen":new Date(),"name":name}
		}

	}
     saveSubscription();
     sendPush(sub,player_id,name);
}

function subscriberExists(sub){
	isExists=false;
	id="";
	Object.entries(subscribers).map(entry=>{
		let key=entry[0];
		let value=entry[1];
		if(value['endpoint']==sub['endpoint']){
			console.log("subscriber with this end point already exists");
			isExists=true;
			id=key;    //wont return from .map function , need to optimize later when handling huge data
		}
	})
	if(!isExists){
		id = generateId(6);
		subscribers[id]=sub;
	}

	return id;
}

function saveSubscription(){
	fs.writeFile("./subscribers/webSubscribers.json",JSON.stringify(subscribers,null,4),function(err){
		console.log(err);
	});
	fs.writeFile("./subscribers/players.json",JSON.stringify(players,null,4),function(err){
		console.log(err);
	});
	console.log("saved");
}

function sendPush(subscription,player_id,name){
       payload=JSON.stringify({
    "notification": {
	    "title": name+" is playing now !",
	    "body": "Join now "+name+" is waiting for you",
	    "icon": "assets/icons/icon-192x192.png",
	    "vibrate": [100, 50, 100],
	    "requireInteraction":true,
	    "data": {"dateOfArrival": Date.now(),},
	    "actions": [{"action": "nothing","title": "Launch Bombsquad",}] //need to send link of the web app
    }})
      webPush.sendNotification(subscription, payload)
        .catch(error => console.error(error));
}

function notifyFor(player_id){
		if(player_id in players){
			 	for(sub_id in players[player_id]["webpush"] ){
			 		 if(players[player_id]["webpush"][sub_id] in subscribers){
			 		 	     sendPush(subscribers[players[player_id]["webpush"][sub_id]],player_id,players[player_id]["name"]);    //player_id need to be change with Player name(for payload only) , later
			 		 }
			 	}
		}
}

function generateId(length) {
    var result           = '';
    var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
   }
   return result;
}

module.exports={
	subscribe:subscribe,
	notifyFor:notifyFor
}
