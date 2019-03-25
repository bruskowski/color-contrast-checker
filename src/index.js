import React from "react";
import ReactDOM from "react-dom";
import Picker from "./picker";

import "./styles.css";

function App() {
  return (
    <div className="App">
      <Picker />
    </div>
  );
}

const rootElement = document.getElementById("root");
ReactDOM.render(<App />, rootElement);
