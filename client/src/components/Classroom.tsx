import * as React from "react";
import { Component } from "react";
import { RouteComponentProps } from "react-router";
import * as io from "socket.io-client";

import { Instructors } from "./Instructors";
import Poll from "./Poll";
import { Student } from "./Student";
import { Students } from "./Students";
import { Video } from "./Video";

interface IProps
  extends RouteComponentProps<{ id: string }, {}, { name?: string }> {}

interface IState {
  showPoll: boolean;
  students: IUser[];
  instructors: IUser[];
}

class Classroom extends Component<IProps, IState> {
  public socket: SocketIOClient.Socket;
  public student: IUser;
  constructor(props: IProps) {
    super(props);
    this.state = {
      instructors: [],
      showPoll: true,
      students: []
    };
  }
  public componentDidMount() {
    this.socket = io();
    this.socket.on("connect", () => {
      this.student = {
        classroom: this.props.match.params.id.toUpperCase(),
        id: this.socket.id,
        instructor: false,
        name: this.props.location.state
          ? this.props.location.state.name || "Guest"
          : "Guest",
        raisedHand: false,
        status: ""
      };
      this.socket.emit("join classroom", this.student);
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
        console.log(instructors);
        this.setState({ students, instructors });
      }
    );
    this.socket.on("update user", (student: IUser) => {
      this.student = student;
    });
  }
  public render() {
    return (
      <div>
        <h2>Classroom {this.props.match.params.id}</h2>
        <Video />
        <Poll />
        {this.student && (
          <Student
            editable={true}
            student={this.student}
            socket={this.socket}
          />
        )}
        <Instructors instructors={this.state.instructors} />
        <Students students={this.state.students} socket={this.socket} />
      </div>
    );
  }
}

export { Classroom };
