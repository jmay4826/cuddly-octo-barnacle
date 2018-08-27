import React, { Component } from "react";
import { Button } from "material-ui";

class EnterClassroom extends Component {
  constructor() {
    super();
    this.state = {
      classroom: "",
      name: ""
    };
  }

  updateClassroom = ({ target: { value: classroom } }) => {
    this.setState({ classroom });
  };
  updateName = ({ target: { value: name } }) => {
    this.setState({ name });
  };
  enterClassroom = () => {
    this.props.history.push(this.state.classroom, { name: this.state.name });
  };

  render() {
    return (
      <div>
        <h2>Enter Classroom ID</h2>
        <input onChange={this.updateClassroom} value={this.state.classroom} />
        <input onChange={this.updateName} value={this.state.name} />
        <button onClick={this.enterClassroom}>Go</button>
      </div>
    );
  }
}

export default EnterClassroom;
