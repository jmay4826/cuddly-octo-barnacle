import * as React from "react";
import { Component } from "react";
import { RouteComponentProps } from "react-router";
import * as io from "socket.io-client";

import { EditableStudent } from "./EditableStudent";

interface IProps extends RouteComponentProps<{ id: string }> {}

interface IState {
  students: IUser[];
  instructors: IUser[];
}

class Instructor extends Component<IProps, IState> {
  public socket: SocketIOClient.Socket;
  constructor(props: IProps) {
    super(props);
    this.state = { students: [], instructors: [] };
  }
  public componentDidMount() {
    this.socket = io();
    this.socket.on("connect", () => {
      this.socket.emit("join classroom", {
        classroom: this.props.match.params.id.toUpperCase(),
        id: this.socket.id,
        instructor: true,
        name: "Instructor"
      });
    });
    this.socket.on(
      "new user",
      ({
        students,
        instructors
      }: {
        students: IUser[];
        instructors: IUser[];
      }) => {
        this.setState({ students, instructors });
      }
    );
  }
  public render() {
    return (
      <div>
        <h2>Instructor View</h2>
        {this.state.students.map(student => (
          <EditableStudent student={student} socket={this.socket} />
        ))}
      </div>
    );
  }
}

export { Instructor };
