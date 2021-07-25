import * as express from 'express';
import * as http from 'http';
import * as WebSocket from 'ws';
import * as path from 'path';

const dungeon = require('../../dungeon');

const app = express();

// view engine setup
app.set('views', path.join(__dirname, '../views'));
app.set('view engine', 'pug');

// static files setup
app.use(express.static('public'));

app.get("/", (req, res) => {
    res.render("index");
});

//initialize a simple http server
const server = http.createServer(app);

//initialize the WebSocket server instance
const wss = new WebSocket.Server({ server });

var connection_count: number = 0;

wss.on('connection', (ws: WebSocket) => {
    connection_count ++;
    const connection_id = connection_count;
    //send immediatly a feedback to the incoming connection    
    ws.send(`CON #${connection_id}`);
    console.log(`${connection_id} CONNECTED`);

    function print(msg: string) {
        console.log(`OUT[${connection_id}] ${msg}`);
        ws.send(msg);
    }

    dungeon.world.print = print;
    dungeon.play(dungeon.player, dungeon.world);

    ws.on('message', (message: string) => {
        //log the received message and send it back to the client
        console.log('received from %d: %s', connection_id, message);
        if (message.startsWith("CMD ")) {
            message = message.substring(4);
            dungeon.world.print = print;
            dungeon.play(dungeon.player, dungeon.world, message);
        } else {
            ws.send(`Hello, you sent -> ${message}`);
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

