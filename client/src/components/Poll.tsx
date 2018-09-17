import * as React from "react";

class Poll extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      visible: false
    };
  }
  render() {
    return <h1>Poll</h1>;
  }
}

export default Poll;
