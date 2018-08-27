import React, { Component } from "react";
import io from "socket.io-client";

import Users from "./Users";
import Poll from "./Poll";

class Classroom extends Component {
  constructor() {
    super();
    this.state = {
      users: [],
      showPoll: true
    };
  }
  componentDidMount() {
    this.socket = io();

    console.log(this.props);
    this.socket.on("connect", () => {
      console.log("connected");
      this.socket.emit("join classroom", {
        instructor: false,
        raisedHand: false,
        avatar: null,
        classroom: this.props.match.params.id,
        name: this.props.location.state
          ? this.props.location.state.name
          : "Guest"
      });
    });

    this.socket.on("new user", users => {
      console.log(users);
      this.setState({ users });
    });
  }
  render() {
    return (
      <div>
        <h1>Classroom</h1>
        {this.state.showPoll && <Poll />}
        <Users users={this.state.users} socket={this.socket} />
      </div>
    );
  }
}

export default Classroom;
