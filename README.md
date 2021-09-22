# BallisticaWeb

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 12.2.5.

## Requirements
Node: v12.15.0
Npm: 6.13.4
[Ballistica](https://github.com/efroemling/ballistica) : 1.6

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

## Getting Started

Clone this repo `git clone https://github.com/imayushsaini/ballistica-web-stats.git`
Change dir  `cd ballistica-web-stats`
Install dependencies `npm install`
Install web-push module `npm install web-push -g`
Generate the VAPID keys `web-push generate-vapid-keys --json`
Save public and private keys in variables.env
Build the project `npm run-script build`
Start the server `npm start`

## Build

Run `npm run-script build` to build the project. The build artifacts will be stored in the `dist/` directory.
*Project need to be build after any UI component change or variables.env . 

## For Bombsquad Server

Install the plugin [FLASK_API](https://github.com/imayushsaini/ballistica-web-stats/tree/BS1.6_Plugin)
Checkout [BS1.6_Server_mods](https://github.com/imayushsaini/Bombsquad-Ballistica-Modded-Server) to generate Stats for your server.
Need to open port `5000` on your Bombsquad server instance.
or setup reverse proxy with nginx with port `80` , Google for more info.

## Hosting

### Host along with your game server
- if facing any issue in opening port 
- do same setup in your BS instance and change `variables.env/SERVER_API` to `http://127.0.0.1:5000` 

### Host on replit 
- fork this repo , connect replit with your repo .
- update variables.env
- execute `npm run-script build` in replit shell
- Press RUN button
- Set repl as `always on` (hacker account) , use Up-monitor to ping your server to keep it alive (if using free account).
