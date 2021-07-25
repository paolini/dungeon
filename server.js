const express = require('express');
const http = require('http');
const WebSocket = require('ws');

const dungeon = require('./dungeon');

const app = express();

app.use(express.static("client/build"));

//initialize a simple http server
const server = http.createServer(app);

//initialize the WebSocket server instance
const wss = new WebSocket.Server({ server });

var connections = [];

var connection_count = 0;

wss.on('connection', (ws, req, client) => {
    connection_count ++;
    const connection_id = connection_count;
    //send immediatly a feedback to the incoming connection    
    ws.send(`CON ${connection_id}`);
    console.log(`${connection_id} CONNECTED`);

    const connection = {
        "id": connection_id,
        "client": client,
        "player": null,
        "world": null
    };

    connections.push(connection);

    function print(player, msg) {
        console.log(`${connection_id} OUT ${msg}`);
        ws.send("OUT " + msg);
    }

    dungeon.world.print = print;

    ws.on('message', (message) => {
        //log the received message and send it back to the client
        console.log(`${connection_id}>${message}`, connection_id, message);
        if (message.startsWith("STA ")) {
            message = message.substring(4);
            const player = dungeon.world.add_item({
                attributes: ["player", "container"],
                name: message,
                description: "un bel tipo",
                "connection_id": connection_id 
            });
            connection.player = player;
            connection.world = dungeon.world;
            ws.send("PLA " + player.id);
            console.log(connection_id + " PLAY");
            dungeon.play(player, dungeon.world);
            dungeon.world.where(player);
        } else if (message.startsWith("CMD ")) {
            message = message.substring(4);
            dungeon.world.print = print;
            dungeon.play(dungeon.player, dungeon.world, message);
        } else {
            ws.send(`Hello, you wrote -> ${message}`);
        }
    });
});

//start our server
server.listen(process.env.PORT || 8999, () => {
    const address = server.address();
    if (! address || typeof(address) === "string") {
        console.log(`Error: address = ${address}`);
        return;
    }
    console.log(`Server started: http://localhost:${address.port}`);
});

