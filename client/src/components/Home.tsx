import * as React from "react";
import { Component } from "react";
import { RouteComponentProps } from "react-router";

interface IProps extends RouteComponentProps<{}> {}

interface IState {
  classroom: string;
  name: string;
}

class Home extends Component<IProps, IState> {
  constructor(props: IProps) {
    super(props);
    this.state = {
      classroom: "",
      name: ""
    };
  }

  public updateClassroom = ({
    target: { value: classroom }
  }: {
    target: { value: string };
  }) => {
    this.setState({ classroom });
  };
  public updateName = ({
    target: { value: name }
  }: {
    target: { value: string };
  }) => {
    this.setState({ name });
  };
  public enterClassroom = () => {
    this.props.history.push(this.state.classroom.toUpperCase(), {
      name: this.state.name
    });
  };

  public render() {
    return (
      <div className="enter-classroom-container">
        <h2>Join a Classroom</h2>
        <input
          className="home-input"
          placeholder="Classroom ID"
          onChange={this.updateClassroom}
          value={this.state.classroom}
        />
        <input
          className="home-input"
          placeholder="Your Name"
          onChange={this.updateName}
          value={this.state.name}
        />
        <button
          className="enter-classroom-button"
          onClick={this.enterClassroom}
        >
          Go
        </button>
      </div>
    );
  }
}

export { Home };
