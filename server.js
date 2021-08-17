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

function print(player, msg) {
//    console.log(`print(${player.id}, "${msg}")`);
    connections.forEach(connection => {
        if (connection.player && connection.ws && connection.player.id === player.id) {
            console.log(`${connection.id} OUT ${msg}`);
            connection.ws.send("OUT " + msg);
        }
    });
}

function broadcast(item, msg) {
    connections.forEach(connection => {
        if (connection.player && connection.ws && connection.player.id !== item.id) {
            console.log(`${connection.id} OUT ${msg}`);
            connection.ws.send("OUT " + msg);
        }
    });
}

dungeon.world.print = print; // ATTENZIONE: non c'è il bind!
dungeon.world.broadcast = broadcast;

wss.on('connection', (ws, req, client) => {
    connection_count ++;
    const connection_id = connection_count;

    const connection = {
        "id": connection_id,
        "ws": ws,
        "client": client,
        "player": null,
        "world": null
    };

    connections.push(connection);

    //send immediatly a feedback to the incoming connection    
    ws.send(`CON ${connection_id}`);
    console.log(`${connection_id} CONNECTED`);

    ws.on('message', (message) => {
//        console.log("--- " + message);
        if (message.startsWith("STA ")) {
            const name = message.substring(4);
            var player = dungeon.world.item_by_name(name);
            if (player) {
                ws.send("ERR nome già utilizzato");
                console.log("name already in use: " + name);
            } else {
                player = dungeon.world.add_item({
                    attributes: ["player", "container"],
                    'name': name,
                    description: "un bel tipo",
                    "connection_id": connection_id
                });
                connection.player = player;
                connection.world = dungeon.world;
                ws.send("PLA " + player.id);
                console.log(connection_id + " PLAY " + player.id);
                dungeon.play(player, dungeon.world);
                dungeon.world.where(player);
            }
        } else if (message.startsWith("CMD ")) {
            message = message.substring(4);
            dungeon.play(connection.player, connection.world, message);
            connection.world.save("world.json");
        } else {
            ws.send(`Hello, you wrote -> ${message}`);
        }
    });
    ws.on('close', (code, msg) => {
        console.log(`${connection_id} CLOSE ${code} ${msg}`);
        connection.ws = null;
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

