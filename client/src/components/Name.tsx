import * as React from "react";
import { Component } from "react";

interface IProps {
  student: IUser;
  editable: boolean;
  socket: SocketIOClientStatic["Socket"];
}

class Name extends Component<IProps, { name: string }> {
  constructor(props: IProps) {
    super(props);
    this.state = { name: "" };
  }
  public handleName = ({
    target: { value: name }
  }: {
    target: { value: string };
  }) => this.setState({ name: !name.length ? " " : name });
  public updateName = () => {
    this.props.socket.emit("update user", {
      ...this.props.student,
      name: this.state.name
    });
    this.setState({ name: "" });
  };

  public render() {
    return (
      <div className="student-name-container">
        <input
          className={`student-name ${this.props.editable && "editable"}`}
          onChange={this.props.editable ? this.handleName : undefined}
          value={this.state.name || this.props.student.name}
          readOnly={!this.props.editable}
        />
        {this.props.editable && (
          <button
            className={`update-name-button ${this.state.name ? "active" : ""}`}
            onClick={this.updateName}
          >
            Update Name
          </button>
        )}
      </div>
    );
  }
}
export { Name };
