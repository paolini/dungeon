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
    let WS_URL = process.env.REACT_APP_WSURL || (
      (window.location.protocol === "https:" ? "wss://" : "ws://") 
    	+ window.location.hostname
  	  + (window.location.port ? ":" + window.location.port : ""));

    // to override the WSURL export REACT_APP_WSURL environment variable. Example:
    // export REACT_APP_WSURL="ws://localhost:8999"

    this.client = new W3CWebSocket(WS_URL);
    this.add_message("connessione all'indirizzo " + WS_URL, 'warning');

    this.client.onopen = () => {
      this.add_message("websocket Client connected", 'warning');
      console.log('WebSocket Client Connected');
    };

    this.client.onmessage = (message) => {
      const cmd = message.data.substr(0, 3);
      const msg = message.data.substr(4);
      if (cmd === "ERR") {
        this.add_message(msg, 'error');
      } if (cmd === "CON") {
        this.connection_id = parseInt(msg);
        this.setState({mode: "connected"});
      } else if (cmd === "OUT") {
        this.add_message(`${ msg }`, 'output');
      } else if (cmd === "PLA") {
        console.log("player_id " + msg);
        this.setState({mode: "play"})
      } else {
        console.log("invalid message: " + message.data);
      }
    };

    this.client.onclose = (event) => {
      this.add_message(`connessione chiusa ${event}`);
      console.log('remote connection closed');
      this.setState({mode: "disconnected"});
    };

    this.client.onerror = (event) => {
      this.add_message(`errore di connessione ${event.target.url}`, 'error');
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

  componentDidUpdate() {
    window.scrollTo(0,document.body.scrollHeight);
    const inputEl = this.inputRef.current;
    if (inputEl) inputEl.focus();
  }

  add_message(text, cls) {
    if (!cls) cls="white";
    let messages = this.state.messages;
    messages.push({text, cls});
    this.setState({"messages": messages});
  } 

  command(msg) {
    this.add_message(`${msg}`, 'input');
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
              { this.state.messages.map((msg, i) => 
              <li key={ i } className={msg.cls}>{ msg.text }</li>) }          
          </ul>
          <div>
          { 
            this.state.mode === "disconnected" &&
            <button onClick={this.connect}>connettiti al server</button>
          }
          { 
            this.state.mode === "connected" &&
            <div className='input'>
              <input
              ref={ this.inputNameRef }
              placeholder="nome del giocatore"
              ></input>
              <button onClick={this.start}>entra!</button>
            </div>
          }
          { this.state.mode === "play" &&
          <div className='input'>&gt;&nbsp;<input 
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
