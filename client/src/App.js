import React, { Component } from 'react';
import { w3cwebsocket as W3CWebSocket } from "websocket";

import './App.css';

class App extends Component {
  constructor() {
    super();
    this.state = {
      mode: "disconnected",
      messages: [],
    };
    this.inputRef = React.createRef();
    this.inputNameRef = React.createRef();
    this.inputChange = this.inputChange.bind(this);
    this.connect = this.connect.bind(this);
    this.start = this.start.bind(this);
  }
  
  connect() {
    let WS_URL = (window.location.protocol === "https:" ? "wss://" : "ws://") 
    	+ window.location.hostname
  	  + (window.location.port ? ":" + window.location.port : "");

    // WS_URL = "ws://localhost:8999"; // for development;

    this.client = new W3CWebSocket(WS_URL);
    this.add_message("connessione all'indirizzo " + WS_URL);

    this.client.onopen = () => {
      this.add_message("websocket Client connected");
      console.log('WebSocket Client Connected');

    };

    this.client.onmessage = (message) => {
      const cmd = message.data.substr(0, 3);
      const msg = message.data.substr(4);
      if (cmd === "CON") {
        this.connection_id = parseInt(msg);
        this.setState({mode: "connected"});
      } else if (cmd === "OUT") {
        this.add_message(`> ${ msg }`);
      } else if (cmd === "PLA") {
        console.log("player_id " + msg);
        this.setState({mode: "play"})
      } else {
        console.log("invalid message: " + message.data);
      }
    };

    this.client.onerror = (event) => {
      this.add_message(`errore di connessione ${event.target.url}`);
      console.log("ERROR: " + event);
      this.setState({mode: "disconnected"});
    }
  }

  start() {
    const name = this.inputNameRef.current.value;
    if (name.length > 0) {
      this.client.send("STA " + name);
    }
  }

  componentDidMount() {
    this.connect();
  }

  add_message(msg) {
    let messages = this.state.messages;
    messages.push(msg);
    this.setState({"messages": messages});
  } 

  command(msg) {
    this.add_message(`< ${msg}`);
    this.client.send("CMD " + msg);
  }

  inputChange(event) {
    if (event.code === "Enter") {
      this.command(this.inputRef.current.value);
      this.inputRef.current.value = "";
    }
  }

  render() {
    return (
      <div className="App">
        <header className="App-header">
          <ul>
              { this.state.messages.map((msg, i) => <li key={ i }>{ msg }</li>) }          
          </ul>
          <div>
          { 
            this.state.mode === "disconnected" &&
            <button onClick={this.connect}>connettiti al server</button>
          }
          { 
            this.state.mode === "connected" &&
            <div>
              <input
              ref={ this.inputNameRef }
              placeholder="nome del giocatore"
              ></input>
              <button onClick={this.start}>entra!</button>
            </div>
          }
          { this.state.mode === "play" &&
          <div>&gt;&nbsp;<input 
            placeholder="cosa devo fare?"
            onKeyUp={this.inputChange}
            type="text"
            ref={ this.inputRef }
          ></input></div>
          }
          </div>
        </header>
      </div>
    );
  }
}

export default App;
