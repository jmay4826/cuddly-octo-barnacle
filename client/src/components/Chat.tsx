import * as React from "react";
import { Component } from "react";

interface IProps {
  users: any;
  socket: any;
}

class Chat extends Component<IProps, object> {
  public render() {
    return <div>Chat</div>;
  }
}

export { Chat };
