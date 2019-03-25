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
          path="/:foreground?/:object?/:background?/:swatch4?/:swatch5?/:swatch6?/:swatch7?/:swatch8?"
          render={({ match }) => (
            <Picker
              foreground={match.params.foreground}
              object={match.params.object}
              background={match.params.background}
              swatches={[
                match.params.swatch4,
                match.params.swatch5,
                match.params.swatch6,
                match.params.swatch7,
                match.params.swatch8,
              ]}
            />
          )}
        />
      </Router>
    </div>
  );
}

const rootElement = document.getElementById("root");
ReactDOM.render(<App />, rootElement);
