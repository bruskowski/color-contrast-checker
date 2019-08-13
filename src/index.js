import React from "react";
import ReactDOM from "react-dom";
import Picker from "./picker";
import { BrowserRouter as Router, Route } from "react-router-dom";

import "./styles.css";

function App() {
  return (
    <div className="App">
      <Router>
        <Route
          render={({ location }) => (
            <Picker
              foreground={location.pathname.split("/")[1]}
              object={location.pathname.split("/")[2]}
              background={location.pathname.split("/")[3]}
              swatches={location.pathname.split("/").slice(4)}
            />
          )}
        />
        <div className="small-print source">
          AA Large applies to text > 24px or > 18.5px for bold fonts. Learn
          more:{" "}
          <a href="https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum">
            Text Contrast
          </a>{" "}
          <a href="https://www.w3.org/WAI/WCAG21/Understanding/non-text-contrast">
            Non-text Contrast
          </a>
          <br />
          Inspired by{" "}
          <a href="https://contrast-checker.glitch.me/">
            the GOV.uk contrast checker on glitch
          </a>
          , made with{" "}
          <a href="https://codesandbox.io/s/0053my42jp">CodeSandbox</a>. |{" "}
          <a href="https://github.com/richardbruskowski/color-contrast-checker">
            GitHub
          </a>{" "}
          | <a href="https://twitter.com/bruskowski">Twitter</a>
        </div>
      </Router>
    </div>
  );
}

const rootElement = document.getElementById("root");
ReactDOM.render(<App />, rootElement);
