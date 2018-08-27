import React, { Component } from "react";
import { BrowserRouter, Route, Switch } from "react-router-dom";
import Setup from "./components/setup";
import Classroom from "./components/Classroom";
import EnterClassroom from "./components/EnterClassroom";
import Instructor from "./components/Instructor";

const App = () => (
  <BrowserRouter>
    <Switch>
      <Route path="/:id/instructor" component={Instructor} />
      <Route path="/:id" component={Classroom} />
      <Route path="/" component={EnterClassroom} />
    </Switch>
  </BrowserRouter>
);

export default App;
