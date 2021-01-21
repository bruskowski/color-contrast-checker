import React from "react"
import ReactDOM from "react-dom"
import Picker from "./picker"
import { BrowserRouter as Router, Route } from "react-router-dom"

import "./styles.css"

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
          AA Large applies to text &gt; 24px or &gt; 18.5px for bold fonts.
          Learn more:{" "}
          <a href="https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum">
            Text Contrast
          </a>{" "}
          <a href="https://www.w3.org/WAI/WCAG21/Understanding/non-text-contrast">
            Non-text Contrast
          </a>{" "}
          (WCAG 2.1)
          <br />
          For APCA font size and weight need to be taken into account, so the
          little colored dotis not really meaningful:{" "}
          <a href="https://www.w3.org/WAI/GL/WCAG3/2020/methods/font-characteristics-contrast/">
            WCAG 3.0 APCA
          </a>{" "}
          (Working Draft)
          <br />
          Inspired by{" "}
          <a href="https://contrast-checker.glitch.me/">
            the GOV.uk contrast checker on glitch
          </a>
          , made with{" "}
          <a href="https://codesandbox.io/s/github/richardbruskowski/color-contrast-checker">
            CodeSandbox
          </a>
          . |{" "}
          <a href="https://github.com/richardbruskowski/color-contrast-checker">
            GitHub
          </a>
          <br />
          Made by{" "}
          <a href="https://bruskowski.design">
            <img
              src="/icon-48x48.png"
              width={24}
              height={24}
              alt=""
              style={{ verticalAlign: "middle" }}
            />{" "}
            bruskowski.design
          </a>
        </div>
      </Router>
    </div>
  )
}

const rootElement = document.getElementById("root")
ReactDOM.render(<App />, rootElement)
