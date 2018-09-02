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
  otherStudents: IUser[];
  instructors: IUser[];
  student: IUser;
}

class Classroom extends Component<IProps, IState> {
  public socket: SocketIOClient.Socket;
  public student: IUser;
  constructor(props: IProps) {
    super(props);
    this.state = {
      instructors: [],
      otherStudents: [],
      showPoll: true,
      student: {
        classroom: "",
        id: "",
        instructor: false,
        name: "",
        raisedHand: false,
        status: ""
      }
    };
  }
  public componentDidMount() {
    this.socket = io();
    this.socket.on("connect", () => {
      this.setState(
        {
          student: {
            classroom: this.props.match.params.id.toUpperCase(),
            id: this.socket.id,
            instructor: false,
            name: this.props.location.state
              ? this.props.location.state.name || "Guest"
              : "Guest",
            raisedHand: false,
            status: ""
          }
        },
        () => this.socket.emit("join classroom", this.state.student)
      );
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
        const student = students.find(({ id }) => id === this.socket.id);
        const otherStudents = students.filter(
          ({ id }) => id !== this.socket.id
        );
        if (student) {
          this.setState({ otherStudents, instructors, student });
        }
      }
    );
  }
  public render() {
    return (
      <div className="classroom-container">
        <div className="classroom-content">
          <h2 className="classroom-name">{this.props.match.params.id}</h2>
          <Video />
          <Poll />
        </div>
        <div className="classroom-sidebar">
          {this.state.student.id && (
            <Student
              editable={true}
              student={this.state.student}
              socket={this.socket}
            />
          )}
          <Instructors instructors={this.state.instructors} />
          <Students students={this.state.otherStudents} socket={this.socket} />
        </div>
      </div>
    );
  }
}

export { Classroom };
