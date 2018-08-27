import * as React from "react";

import { Component } from "react";
import { StatusBar } from "./StatusBar";

interface IProps {
  student: IStudent;
  socket: SocketIOClientStatic["Socket"];
}

interface IState {
  name: string;
}

class EditableStudent extends Component<IProps, IState> {
  constructor(props: IProps) {
    super(props);
    this.state = { name: props.student.name };
  }
  public handleUsername = ({
    target: { value: name }
  }: {
    target: { value: string };
  }) => {
    this.setState({ name });
  };

  public render() {
    return (
      <div className="current-student-container">
        <StatusBar
          editable={true}
          socket={this.props.socket}
          student={this.props.student}
        />
        <span>{this.props.student.id}</span>
        <input onChange={this.handleUsername} value={this.state.name} />
      </div>
    );
  }
}

export { EditableStudent };
