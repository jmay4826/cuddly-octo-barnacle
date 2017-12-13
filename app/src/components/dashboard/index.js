import React, { Component } from "react";
import { MenuItem, Menu, Icon, Select } from "material-ui";

class Dashboard extends Component {
  constructor(props) {
    super(props);
    console.log(props);
    this.state = {
      questions: [],
      users: [],
      mood: "thumbs_up_down"
    };
    this.raiseHand = this.raiseHand.bind(this);
    this.handleMoodChange = this.handleMoodChange.bind(this);
  }
  handleMoodChange(e) {
    console.log(e.target.value);
    this.setState({ mood: e.target.value, openMenu: "" });
  }

  componentDidMount() {
    this.props.socket.on("userList", users => {
      console.log(users);
      this.setState({ users });
    });
    this.props.socket.on("raisedHand", () => {
      this.setState({ questions: [...this.state.questions, "Another"] });
    });
  }
  raiseHand() {
    this.props.socket.emit("raiseHand");
  }
  render() {
    const { socket } = this.props;

    return (
      <div className="container">
        <div className="sidebar">
          {this.state.users
            .sort((a, b) => (a.id === socket.id ? -1 : 1))
            .map(user => {
              return (
                <div key={user.id}>
                  <Icon
                    id="menuAnchor"
                    style={{ fontSize: "12px" }}
                    onClick={() => {
                      let openMenu =
                        this.state.openMenu === user.id ? "" : user.id;
                      this.setState({ openMenu });
                    }}
                  >
                    {this.state.mood}
                  </Icon>
                  <Menu
                    open={this.state.openMenu === user.id}
                    anchorEl={document.getElementById("menuAnchor")}
                  >
                    <MenuItem
                      onClick={event =>
                        this.setState({ mood: "thumb_up", openMenu: null })}
                    >
                      <Icon style={{ fontSize: "12px" }}>thumb_up</Icon>
                    </MenuItem>
                    <MenuItem
                      onClick={event =>
                        this.setState({
                          mood: "thumbs_up_down",
                          openMenu: null
                        })}
                    >
                      <Icon style={{ fontSize: "12px" }}>thumbs_up_down</Icon>
                    </MenuItem>
                    <MenuItem
                      onClick={event =>
                        this.setState({ mood: "thumb_down", openMenu: null })}
                    >
                      <Icon style={{ fontSize: "12px" }}>thumb_down</Icon>
                    </MenuItem>
                  </Menu>
                  {user.id === socket.id ? (
                    <input
                      className="username"
                      placeholder={user.name}
                      onChange={e =>
                        socket.emit("editUsername", e.target.value)}
                    />
                  ) : (
                    <span>{user.name}</span>
                  )}
                </div>
              );
            })}
        </div>
        {!this.props.admin && (
          <button onClick={this.raiseHand}>Raise Hand</button>
        )}
      </div>
    );
  }
}

export default Dashboard;
