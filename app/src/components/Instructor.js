import React, { Component } from "react";
import io from "socket.io-client";

class Instructor extends Component<object, object> {
  constructor() {
    super();
    this.state = { users: [] };
  }
  componentDidMount() {
    this.socket = io();
    this.socket.on("connect", () => {
      console.log("connected");
      this.socket.emit("join classroom", {
        classroom: this.props.match.params.id,
        name: "Instructor",
        instructor: true
      });
    });
    this.socket.on("new user", users => {
      this.setState({ users });
    });
  }
  render() {
    return (
      <div>
        <h2>Instructor View</h2>
        <p>{JSON.stringify(this.state.users)}</p>
      </div>
    );
  }
}
export default Instructor;
