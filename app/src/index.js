import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import registerServiceWorker from "./registerServiceWorker";
import { BrowserRouter, Route, Switch } from "react-router-dom";
import Setup from "./components/setup";
import Classroom from "./components/classroom";

ReactDOM.render(
  <BrowserRouter>
    <Switch>
      <Route path="/:id" component={Classroom} />
      <Route path="/" component={Setup} />
    </Switch>
  </BrowserRouter>,
  document.getElementById("root")
);
registerServiceWorker();
