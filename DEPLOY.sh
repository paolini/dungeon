#!/bin/bash

set -e

git pull

# WARNING: this file might have been modified. In that case we are executing the old script

npm install

pushd client
npm install
npm run build
popd

pm2 restart server.js
