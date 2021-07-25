# command line execution:

  node dungeon.js

# server

* to download the required packages

  npm install

* to compile typescript code

  tsc
  
* then run the server
  
  node server.js

# client

* install & build

  npm install
  npm run build

* enter directory `client` and run with:

  npm start

this will start a development server to serve static files while trying to 
connect to the game server with websockets.
  
# deployment

* clone the repository on the server. Build:
  
  npm install
  tsc
  pushd client
  npm install
  npm run build
  popd

* run the server:

  pm2 start server.js

(install pm2 with: `sudo npm install -g pm2`).

* Use nginx as reverse proxy:

  server {
    server_name your.server.name;

    location / {
        proxy_pass http://localhost:8999;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
  }

* use `certbot` to provide secure connection:

  certbot

