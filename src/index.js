import React from "react";
import ReactDOM from "react-dom";
import Picker from "./picker";
import { BrowserRouter as Router, Route, Link } from "react-router-dom";

import "./styles.css";

function App() {
  return (
    <div className="App">
      <Router>
        <Route
          path="/:foreground?/:object?/:backround?"
          render={({ match }) => (
            <Picker
              foreground={match.params.foreground}
              object={match.params.object}
              background={match.params.background}
            />
          )}
        />
      </Router>
    </div>
  );
}

const rootElement = document.getElementById("root");
ReactDOM.render(<App />, rootElement);
