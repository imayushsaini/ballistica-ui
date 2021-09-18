const express = require('express');

const bodyParser = require('body-parser');
const path = require('path');
const app= express();
var fs=require('fs');
const webpush = require("./service/webpush.service.js");

var players=require('./subscribers/players.json');

app.use(bodyParser.json());
    
app.use(express.static(path.join(__dirname, 'client')));

var request = require('request');
const port=3000;

var stats;
var playersInGame={};

setInterval(()=>{updateStats()},10000)

function updateStats(){
      request('http://149.129.178.0/getStats',function(err,res,body){
            if(!err&&res.statusCode==200){
                  data=JSON.parse(body);
                  stats=data;
                  livePlayers=data['roster'];
                  processSubscription(livePlayers);
            }
      })
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
      const subscription = req.body['subscription'];
      webpush.subscribe(subscription,req.body['player_id']);
      res.status(201).json({});
    });
    


app.listen(port,()=>console.log(`Server started at port ${port}`))

app.get('/',(req,res)=>res.send('hello world!'));
