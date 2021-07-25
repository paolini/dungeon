import React, { Component } from 'react';
import { w3cwebsocket as W3CWebSocket } from "websocket";

import './App.css';


class App extends Component {
  constructor() {
    super();
    this.state = {
      messages: [],
    };
    this.inputRef = React.createRef();
    this.inputChange = this.inputChange.bind(this);
  }
  
  componentDidMount() {
    this.client = new W3CWebSocket('ws://127.0.0.1:8999');
    
    this.client.onopen = () => {
      this.add_message("websocket Client connected");
      console.log('WebSocket Client Connected');
    };

    this.client.onmessage = (message) => {
      this.add_message(`> ${ message.data }`);
    };

    this.client.onerror = (event) => {
      this.add_message(`connection error ${event.target.url}`);
      console.log("ERROR: " + event);
    }
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
          <p>&gt;&nbsp;
          <input 
            placeholder="cosa devo fare?"
            onKeyUp={this.inputChange}
            type="text"
            ref={ this.inputRef }
          ></input>
          </p>
        </header>
      </div>
    );
  }
}

export default App;
