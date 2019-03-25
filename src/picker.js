import React, { useState } from "react";
import { SketchPicker } from "react-color";
import getRelativeLuminance from "get-relative-luminance";
import chroma from "chroma-js";

const hexContrastCheck = require("wcag-contrast").hex;

const presets = ["#002244", "#0094F0", "#EEF9FF"];

const objToHex = colorObj => {
  return chroma(
    `rgba(${colorObj.r},${colorObj.g},${colorObj.b},${colorObj.a})`
  ).hex();
};

const objToRgba = colorObj => {
  return `rgba(${colorObj.r},${colorObj.g},${colorObj.b},${colorObj.a})`;
};

const objToRgb = colorObj => {
  return `rgb(${colorObj.r},${colorObj.g},${colorObj.b})`;
};

const colorStringToObj = rgba => {
  return {
    r: chroma(rgba).get("rgb.r"),
    g: chroma(rgba).get("rgb.g"),
    b: chroma(rgba).get("rgb.b"),
    a: chroma(rgba).alpha(),
  };
};

const roundedRelativeLuminance = (foreground, background) => {
  const decimals = 2;
  return (
    Math.round(
      getRelativeLuminance(
        objToRgb(background ? flattenColor(foreground, background) : foreground)
      ) * Math.pow(10, decimals)
    ) / Math.pow(10, decimals)
  );
};

const flattenColor = (foreground, background) => {
  const flatColor = chroma
    .mix(objToRgb(background), objToRgb(foreground), foreground.a)
    .css();

  return colorStringToObj(flatColor);
};

const roundedContrast = (foreground, background) => {
  const decimals = 2;
  return (
    Math.round(
      hexContrastCheck(
        objToHex(flattenColor(foreground, background)),
        objToHex(background)
      ) * Math.pow(10, decimals)
    ) / Math.pow(10, decimals)
  );
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

function Contrast({ foreground, background, isNonText }) {
  const contrast = roundedContrast(foreground, background);
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
  const [textColor, updateTextColor] = useState(
    colorStringToObj(
      chroma.valid(props.foreground)
        ? chroma(props.foreground).hex()
        : "#002244"
    )
  );
  const [objectColor, updateObjectColor] = useState(
    colorStringToObj(
      chroma.valid(props.object) ? chroma(props.object).hex() : "#0094F0"
    )
  );
  const [backgroundColor, updateBackgroundColor] = useState(
    colorStringToObj(
      chroma.valid(props.background)
        ? chroma(props.background).hex()
        : "#EEF9FF"
    )
  );

  return (
    <div
      style={{
        lineHeight: "1.5",
        padding: "2em",
        backgroundColor: objToRgb(backgroundColor),
      }}
    >
      <div
        style={{
          padding: "1em",
          backgroundColor: objToRgba(objectColor),
          color: objToRgba(textColor),
          display: "inline-block",
        }}
      >
        Relative Luminosity Text:{" "}
        {roundedRelativeLuminance(
          textColor,
          flattenColor(objectColor, backgroundColor)
        )}
        <br />
        Contrast Text–Object:{" "}
        <Contrast
          foreground={textColor}
          background={flattenColor(objectColor, backgroundColor)}
        />
        <br />
        Relative Luminosity Object:{" "}
        {roundedRelativeLuminance(objectColor, backgroundColor)}
        <br />
        Contrast Object–Background:{" "}
        <Contrast
          foreground={objectColor}
          background={backgroundColor}
          isNonText
        />
      </div>
      <div
        style={{
          padding: "1em",
          color: objToRgba(textColor),
        }}
      >
        <br />
        Relative Luminosity Background:{" "}
        {roundedRelativeLuminance(backgroundColor)}
        <br />
        Contrast Text–Background:{" "}
        <Contrast foreground={textColor} background={backgroundColor} />
        <br />
        <br />
      </div>
      <div
        style={{ display: "flex", flexWrap: "wrap", justifyContent: "center" }}
      >
        <div style={{ margin: "1em" }}>
          Text Color:
          <SketchPicker
            color={textColor}
            disableAlpha={false}
            presetColors={presets}
            onChange={(color, event) => updateTextColor(color.rgb)}
          />
        </div>
        <div style={{ margin: "1em" }}>
          Control Color:
          <SketchPicker
            color={objectColor}
            disableAlpha={false}
            presetColors={presets}
            onChange={(color, event) => updateObjectColor(color.rgb)}
          />
        </div>
        <div style={{ margin: "1em" }}>
          Background Color:
          <SketchPicker
            color={backgroundColor}
            disableAlpha={true}
            presetColors={presets}
            onChange={(color, event) => updateBackgroundColor(color.rgb)}
          />
        </div>
      </div>
    </div>
  );
}
