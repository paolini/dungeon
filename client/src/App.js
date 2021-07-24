import React, { Component } from 'react';
import { w3cwebsocket as W3CWebSocket } from "websocket";

import './App.css';

const client = new W3CWebSocket('ws://127.0.0.1:8999');

class App extends Component {
  componentDidMount() {

    client.onopen = () => {
      console.log('WebSocket Client Connected');
    };

    client.onmessage = (message) => {
      console.log(message);
    };

    client.onerror = (message) => {
      console.log("ERROR: " + message);
    }
  }

  render() {
    return (
      <div className="App">
        <header className="App-header">
          <ul>
          </ul>
        </header>
      </div>
    );
  }
}

export default App;
