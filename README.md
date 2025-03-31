# Ballistica Server Manager

Frontend PWA to manage your BombSquad/Ballisitca game server.
Broadcast Bombsquad server live stats and leaderboard. Notify players when their friends join the game via web push notification and Admin panel to configure a server on fly.

## Requirements
- [Modded Ballistica Scripts](https://github.com/imayushsaini/Bombsquad-Ballistica-Modded-Server) required to set up a game server with rest APIs.



## Getting Started


## Host your website (use [this](https://imayushsaini.github.io/ballistica-ui/home?host=) website, or host your own)
### Option 1 (use this website and add your server)
- Add your game server IP PORT to the end of [this](https://imayushsaini.github.io/ballistica-ui/home?host=) url after "host=" example:
   https://imayushsaini.github.io/ballistica-ui/home?host=192.168.0.1:43210.
- You can share this URL with your players or add it to your server stats button.
- (optional) If you put this link to your server stats button, and add @ip @port like https://imayushsaini.github.io/ballistica-ui/home?host=@ip:@port, then the server will automatically replace @ip with your server IP and port.
  
### Option 2 (host website with your name/domain.)
- Fork this repo
- Enable the workflow that comes with this repo from Actions.
- Repo settings > actions > general > workflow > enable read nad write permission.
- Update variables.env, and enter your server IP:PORT in HOST and your PROXY URL in API_PROXY.
- On your fork go to settings and enable the GitHub page on the gh-page branch.
- Check environments to add your GitHub page URL.
- Now you can share that URL with players or add it to your stats button of the server.

## Get your proxy (optional)
- visit https://dash.deno.com/ log in with github, and select new project > Hello World.
- paste code from this file [proxy.js](https://github.com/imayushsaini/ballistica-ui/blob/main/proxy.js) into your deno,  save and deploy.
- now you will get a link to your proxy.
- Navigate to the change server page and add your proxy URL.

## How to add multiple servers?
- from the nav menu navigate to change server and add your server IP PORT
- add ?host=&lt;IP:PORT&gt; example https://imayushsaini.github.io/ballistica-ui/home?host=192.170.0.1:43210.


## For Bombsquad Server

Checkout [BS1.7 Modded Server](https://github.com/imayushsaini/Bombsquad-Ballistica-Modded-Server) everything is already set up, just enable ballistica_web in settings.json.


