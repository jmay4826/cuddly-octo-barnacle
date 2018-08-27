import React, { Component } from "react";
import openSocket from "socket.io-client";
import Password from "../password";
import Dashboard from "../dashboard";
import "../../App.css";
import axios from "axios";

const socket = openSocket();

class Classroom extends Component {
  constructor(props) {
    super(props);
    console.log(props);
    socket.on("authError", error => {
      this.setState({ error });
    });
    socket.on("authenticated", authentication => {
      console.log(authentication);
      this.setState(authentication);
    });

    this.state = {
      authenticated: false,
      isAdmin: false,
      classroom: props.match.params.id
    };
    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleJoin = this.handleJoin.bind(this);
  }
  handleInputChange(e) {
    this.setState({ password: e.target.value });
  }
  handleJoin() {
    socket.emit("checkPassword", this.state);
  }

  render() {
    return (
      <div>
        <p>{this.state.error}</p>
        {this.state.authenticated ? (
          <Dashboard socket={socket} admin={this.state.isAdmin} />
        ) : (
          <Password
            handleInputChange={this.handleInputChange}
            handleJoin={this.handleJoin}
          />
        )}
      </div>
    );
  }
}

export default Classroom;
