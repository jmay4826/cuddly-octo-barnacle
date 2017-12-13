import React from "react";

function Password(props) {
  return (
    <div>
      <input onChange={props.handleInputChange} />
      <button onClick={props.handleJoin}>Join</button>
    </div>
  );
}

export default Password;
