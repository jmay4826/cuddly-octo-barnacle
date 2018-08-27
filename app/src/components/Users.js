import React, { Component } from "react";

class Users extends Component {
  raiseHand(user) {
    return () => {
      console.log(user);
      this.props.socket.emit("update user", { ...user, raisedHand: true });
    };
  }
  render() {
    return (
      <div>
        <ul>
          {this.props.users.map(user => (
            <li key={user.id}>
              <button onClick={this.raiseHand(user)}>Raise Hand</button>
              {JSON.stringify(user.raisedHand)}
              <button>Green</button>
              <button>Yellow</button>
              <button>Red</button>
              <input onChange={() => true} value={user.name} />
            </li>
          ))}
        </ul>
      </div>
    );
  }
}

export default Users;
