import React, { Component } from "react";
import "./App.css";
import openSocket from "socket.io-client";
const socket = openSocket();

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      users: [],
      questions: []
    };
    socket.on("user list", users => this.setState({ users }));
    socket.on("question added", questions => this.setState({ questions }));
    this.editUsername = this.editUsername.bind(this);
    this.askQuestion = this.askQuestion.bind(this);
    this.makeAdmin = this.makeAdmin.bind(this);
  }

  editUsername() {
    socket.emit("editUsername", this.state.username);
  }
  askQuestion() {
    socket.emit("question", this.state.question);
  }
  makeAdmin() {
    socket.emit("makeAdmin");
  }

  render() {
    return (
      <div>
        <p>
          <input
            style={{ border: "1px solid black" }}
            type="text"
            onChange={e => {
              this.setState({ username: e.target.value });
            }}
          />
          <button onClick={this.editUsername}>Edit Username</button>
          <br />
          <button onClick={this.makeAdmin}>Make Admin</button>
        </p>
        <ul>{this.state.users.map(user => <li>{user.name}</li>)}</ul>
        <textarea onChange={e => this.setState({ question: e.target.value })}>
          {this.state.question}
        </textarea>
        <button onClick={this.askQuestion}>Ask Question</button>
        <div>{JSON.stringify(this.state.questions)}</div>
      </div>
    );
  }
}

export default App;
