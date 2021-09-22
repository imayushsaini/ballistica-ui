const express = require('express');

const bodyParser = require('body-parser');
const path = require('path');
const app= express();
var fs=require('fs');
const webpush = require("./service/webpush.service.js");

var players=require('./subscribers/players.json');
var cors=require('cors')
app.use(bodyParser.json());
app.use(cors())
app.use(express.static(path.join(__dirname, 'dist/ballistica-web')));

var request = require('request');


require('dotenv').config({ path: 'variables.env' });
const publicVapidKey = process.env.PUBLIC_VAPID_KEY;
const API=process.env.SERVER_API;
const port=3000;

var stats;
var playersInGame={};
var leaderboard={};
var top200={};
setInterval(()=>{updateStats()},10*1000);
setInterval(()=>{updateLeaderboard()},30*60*1000);


function updateLeaderboard(){
      request(API+'/getLeaderboard',function(err,res,body){
            if(!err&&res.statusCode==200){
                  leaderboard=JSON.parse(body);
            }
      });
      request(API+'/getTop200',function(err,res,body){
            if(!err&&res.statusCode==200){
                  top200=JSON.parse(body);
            }
      });

}
updateLeaderboard() //call it once on server boot , then scheduler will handle it

function updateStats(){
      request(API+'/getStats',function(err,res,body){
            if(!err&&res.statusCode==200){
                  data=JSON.parse(body);
                  stats=data;
                  livePlayers=data['roster'];
                  processSubscription(livePlayers);
            }
      });

}


function processSubscription(livePlayers){

      for(player in livePlayers){
            if(!(player in playersInGame)){
                  // so new player joined the server
                  if(player in players){        //someone subscribed to this player
                        last_seen=new Date(players[player]["last_seen"]);
                        now=new Date();
                        diff = (now-last_seen)/(1000*60);      //in minutes
                        if(diff>=60){                          //ok he playing back after an hour
                           webpush.notifyFor(player);          // inform his subscribers , that he is playinng now
                           //notify by discord dm , coming soon
                        }
                        //update his last seen
                        players[player]["last_seen"]=new Date();

                        fs.writeFile("./subscribers/players.json",JSON.stringify(players,null,4),function(err){
                              console.log(err);
                        });
                  }
            }
      }
      playersInGame=livePlayers;
}





// =============    APIs    ================================

app.post('/subscribe', (req, res) => {
      console.log("received subs request on backend");
      const subscription = req.body['subscription'];
      webpush.subscribe(subscription,req.body['player_id'],req.body['name']);
      res.status(201).json({});
    });

app.get('/live',(req,res)=>{
      res.status(200).json(stats);
})
app.get('/top200',(req,res)=>{
      res.status(200).json(top200);
})
app.get('/leaderboard',(re,res)=>{
      res.status(200).json(leaderboard);
})

app.listen(port,()=>console.log(`Server started at port ${port}`))

app.get('/',(req,res)=>res.send('hello world!'));
