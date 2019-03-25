import React, { useState } from "react";
import { SketchPicker } from "react-color";
import getRelativeLuminance from "get-relative-luminance";
var hexContrastCheck = require("wcag-contrast").hex;

const presets = ["#002244", "#0094F0", "#EEF9FF"];

const roundedRelativeLuminance = hex => {
  const decimals = 2;
  return (
    Math.round(getRelativeLuminance(hex) * Math.pow(10, decimals)) /
    Math.pow(10, decimals)
  );
};

const roundedContrast = (hex1, hex2) => {
  const decimals = 2;
  return (
    Math.round(hexContrastCheck(hex1, hex2) * Math.pow(10, decimals)) /
    Math.pow(10, decimals)
  );
};

const contrast = (hex1, hex2) => {
  const contrast = roundedContrast(hex1, hex2);
  const level =
    contrast >= 7
      ? "AAA"
      : contrast >= 4.5
      ? "AA"
      : contrast >= 3
      ? "AA Large"
      : "fail";

  return contrast + ":1 " + level;
};

function Evaluation({ level }) {
  const style = {
    fontSize: ".65em",
    color: "white",
    backgroundColor:
      level === "fail" ? "red" : level === "AA Large" ? "orange" : "green",
    display: "inline-block",
    padding: "2px 4px",
    borderRadius: 2,
    border: "1px solid white",
    margin: 4,
    marginTop: 0,
  };

  return <span style={style}>{level}</span>;
}

function Contrast({ hex1, hex2, isNonText }) {
  const contrast = roundedContrast(hex1, hex2);
  const level = isNonText
    ? contrast >= 3
      ? "AA"
      : "fail"
    : contrast >= 7
    ? "AAA"
    : contrast >= 4.5
    ? "AA"
    : contrast >= 3
    ? "AA Large"
    : "fail";
  return (
    <span>
      {contrast}:1
      <Evaluation level={level} />
    </span>
  );
}

export default function Picker(props) {
  const [textColor, updateTextColor] = useState("#002244");
  const [objectColor, updateObjectColor] = useState("#0094F0");
  const [backgroundColor, updateBackgroundColor] = useState("#EEF9FF");

  return (
    <div
      style={{
        lineHeight: "1.5",
        padding: "2em",
        backgroundColor: backgroundColor,
      }}
    >
      <div
        style={{
          padding: "1em",
          backgroundColor: objectColor,
          color: textColor,
          display: "inline-block",
        }}
      >
        Relative Luminosity Text: {roundedRelativeLuminance(textColor)}
        <br />
        Contrast Text–Object: <Contrast hex1={textColor} hex2={objectColor} />
        <br />
        Relative Luminosity Object: {roundedRelativeLuminance(objectColor)}
        <br />
        Contrast Object–Background:{" "}
        <Contrast hex1={objectColor} hex2={backgroundColor} isNonText />
      </div>
      <div
        style={{
          padding: "1em",
          color: textColor,
        }}
      >
        <br />
        Relative Luminosity Background:{" "}
        {roundedRelativeLuminance(backgroundColor)}
        <br />
        Contrast Text–Background:{" "}
        <Contrast hex1={textColor} hex2={backgroundColor} />
        <br />
        <br />
      </div>
      <div style={{ display: "flex" }}>
        <div>
          <SketchPicker
            color={textColor}
            disableAlpha={true}
            presetColors={presets}
            onChange={(color, event) => updateTextColor(color.hex)}
          />
        </div>
        <div>
          <SketchPicker
            color={objectColor}
            disableAlpha={true}
            presetColors={presets}
            onChange={(color, event) => updateObjectColor(color.hex)}
          />
        </div>
        <div>
          <SketchPicker
            color={backgroundColor}
            disableAlpha={true}
            presetColors={presets}
            onChange={(color, event) => updateBackgroundColor(color.hex)}
          />
        </div>
      </div>
    </div>
  );
}
