import * as express from 'express';
import * as http from 'http';
import * as WebSocket from 'ws';
import * as path from 'path';

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
    ws.send(`Hi there, I am a WebSocket server. You are connection #${connection_id}`);

    //connection is up, let's add a simple simple event
    ws.on('message', (message: string) => {

        //log the received message and send it back to the client
        console.log('received from %d: %s', connection_id, message);
        ws.send(`Hello, you sent -> ${message}`);
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

