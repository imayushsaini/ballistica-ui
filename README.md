# Ballistica Server Manager

Frontend PWA to manage your BombSquad/Ballisitca game server.
Broadcast Bombsquad server live stats and leaderboard. Notify players when their friends join the game via web push notification and Admin panel to configure a server on fly.

## Requirements
- [Modded Ballistica Scripts](https://github.com/imayushsaini/Bombsquad-Ballistica-Modded-Server) required to set up a game server with rest APIs.



## Getting Started 
## Step 1 > Get your Server Link
- visit https://dash.deno.com/ log in with github, select new project > Hello World.
- paste code from this file [proxy.js](https://github.com/imayushsaini/ballistica-ui/blob/main/proxy.js) into your deno, and change IP PORT, save and deploy.
- now you will get link of your server.

## Step 2 > Host your website (use [this](https://imayushsaini.github.io/ballistica-ui/home?api=) website, or host your own)
### Option 1 (use this website and add your server)
- Now add your deno link/server link from the above step to the end of [this](https://imayushsaini.github.io/ballistica-ui/home?api=) url after "api=" example:
   https://imayushsaini.github.io/ballistica-ui/home?api=https://warm-lobster-20.deno.dev.
- You can share this URL with your players or add it to your server stats button.
  
### Option 2 (host website with your own name.)
- Fork this repo
- Enable the workflow that comes with this repo from Actions.
- Repo settings > actions > general > workflow > enable read nad write permission.
- update variables.env, and enter your server link/deno link you got from the above step 1.
- On your fork go to settings and enable the GitHub page on the gh-page branch.
- Check environments to get add your github page URL.
- Now you can share that URL with players or add it to your stats button of the server.


## How to add multiple servers ?
- You need to repeat Step 1 for each server.
- Now on your website from Option 1 or Option 2
- add ?api=&lt;serverlink&gt; example https://imayushsaini.github.io/ballistica-ui/home?api=https://warm-lobster-20.deno.dev.


## For Bombsquad Server

Checkout [BS1.7 Modded Server](https://github.com/imayushsaini/Bombsquad-Ballistica-Modded-Server) everything is already set up.


