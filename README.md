# BallisticaWeb

A single app to broadcast Bombsquad server live stats and leaderboard over discord channel and on web.And also notify players when their friends join the game via Personal message and push notification.

## Requirements
- Node: v16.13.2
- Npm: 8.1.2
- [Ballistica scripts](https://github.com/imayushsaini/Bombsquad-Ballistica-Modded-Server) 

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.
*Push notification wont work in dev server.

## Getting Started

- Clone this repo `git clone https://github.com/imayushsaini/ballistica-web-stats.git`
- Change dir  `cd ballistica-web-stats`
- Install dependencies `npm install`
- Install web-push module `npm install web-push -g`
- Generate the VAPID keys `web-push generate-vapid-keys --json`
- Create Discord bot and copy token
- Save public , private keys and token in variables.env
- Start the server `npm start`
- Change index.json to port 80 and run as sudo , or better do:
- `sudo apt install nginx` 
- `sudo nano /etc/nginx/sites-enabled/default`
- Near line no. 40 add proxy_pass   eg:
 location / {
		# First attempt to serve request as file, then
		# as directory, then fall back to displaying a 404.
		proxy_pass http://localhost:3000;
	}
- `sudo systemctl restart nginx`
- For notification system to work you need to use https domain, go for cloudflare .

## Build

Run `npm run-script build` to build the project. The build artifacts will be stored in the `dist/` directory.
*Project need to be build after any UI component change or variables.env . 

## For Bombsquad Server

Checkout [BS1.6_Server_mods](https://github.com/imayushsaini/Bombsquad-Ballistica-Modded-Server) everything already setup.

## Hosting

### Host along with your game server
- Just follow #Getting started and dont forget to use cloudflare for https. 

### Host on replit 
- fork this repo , connect replit with your repo .
- update variables.env
- execute `npm run-script build` in replit shell
- Press RUN button
- Set repl as `always on` (hacker account) , use Up-monitor to ping your server to keep it alive (if using free account).
