import React, { Component } from "react";
import openSocket from "socket.io-client";
const socket = openSocket();

class Setup extends Component {
  constructor(props) {
    super(props);
    this.createClassroom = this.createClassroom.bind(this);
    this.joinClassroom = this.joinClassroom.bind(this);
    //need to subscribe to the socket to make sure the random number hasn't been used already
    this.state = {
      classroom: "",
      x: 0,
      y: 0
    };
  }

  componentDidMount() {
    socket.on("position", position =>
      this.setState({ x: position.x, y: position.y })
    );
    socket.on("passwords", classroom => {
      this.setState(classroom);
    });
  }

  createClassroom() {
    const classroom = Math.floor(Math.random() * 100000);
    socket.emit("newClassroom", classroom);
    // this.props.history.push(`${classroom}`);
  }
  joinClassroom() {
    console.log(this.state.classroom);
    this.props.history.push(`/${this.state.classroom}`);
  }
  render() {
    return (
      <div
        onDragOver={e => {
          e.preventDefault();
          e.dataTransfer.dropEffect = "move";
        }}
        onDrop={e => {
          console.log(e);
          this.setState({ x: e.clientX, y: e.clientY });
        }}
      >
        <h1>Create a Classroom</h1>
        <button onClick={this.createClassroom}>Create!</button>
        <h1>Join a Classroom</h1>
        <input
          value={this.state.classroom}
          onChange={e => this.setState({ classroom: e.target.value })}
          placeholder="Enter Classroom ID"
        />
        <button onClick={this.joinClassroom}>Join!</button>
        <div
          style={{ visibility: this.state.classroom ? "visible" : "hidden" }}
        >
          <h2>Classroom: {this.state.classroom}</h2>
          <h2>Teacher Password: {this.state.teacherPassword}</h2>
          <h2>Student Password: {this.state.studentPassword}</h2>
          <button onClick={this.joinClassroom}>Join!</button>
        </div>
      </div>
    );
  }
}

export default Setup;
