import * as React from "react";
import { BrowserRouter, Route, Switch } from "react-router-dom";
import "./App.css";
import { Classroom } from "./components/Classroom";
import { Home } from "./components/Home";
import { Instructor } from "./components/Instructor";

const App = () => (
  <BrowserRouter>
    <Switch>
      <Route path="/:id/instructor" component={Instructor} />
      <Route path="/:id" component={Classroom} />
      <Route path="/" component={Home} />
    </Switch>
  </BrowserRouter>
);

export default App;
