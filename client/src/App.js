import React, { Component } from 'react';
import { w3cwebsocket as W3CWebSocket } from "websocket";

import './App.css';

const client = new W3CWebSocket('ws://127.0.0.1:8999');

class App extends Component {
  constructor() {
    super();
    this.state = {messages: ["msg1", "msg2",]};
  }

  add_message(msg) {
    let messages = this.state.messages;
    messages.push(msg);
    this.setState({"messages": messages});
  } 

  componentDidMount() {
    client.onopen = () => {
      console.log('WebSocket Client Connected');
    };

    client.onmessage = (message) => {
      console.log(message);
    };

    client.onerror = (message) => {
      this.add_message("websocket connection error");
      console.log("ERROR: " + message);
    }
  }

  render() {
    return (
      <div className="App">
        <header className="App-header">
          <ul>
              { this.state.messages.map((msg, i) => <li key={ i }>{ msg }</li>) }          
          </ul>
        </header>
      </div>
    );
  }
}

export default App;
