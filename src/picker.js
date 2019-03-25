import React, { useState } from "react";
import { SketchPicker } from "react-color";
import getRelativeLuminance from "get-relative-luminance";
import chroma from "chroma-js";

const hexContrastCheck = require("wcag-contrast").hex;
const rgbContrastCheck = require("wcag-contrast").rgb;

const presets = ["#002244", "#0094F0", "#EEF9FF"];

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

const flattenColor = (foreground, background) => {
  /*console.log(
    `input flattenColor: rgba(${foreground.r},${foreground.g},${foreground.b},${
    foreground.a
    }) + rgba(${background.r},${background.g},${background.b},${background.a})`
  );*/

  const flatColor = chroma
    .mix(objToRgb(background), objToRgb(foreground), foreground.a)
    .css();

  /*console.log("flattened RGB:" + flatColor);
  console.log("flattened Hex:" + chroma(flatColor).hex());*/
  return colorStringToObj(flatColor);
};

const roundedContrastAlpha = (foreground, background) => {
  //console.log("rounded Arg1: " + foreground);
  /*const hex1 = flattenColor(foreground, background);
  const hex2 = chroma(`rgb(${background.r}, ${background.g}, ${background.b})`).hex();
  console.log(`hex1: ${hex1} – hex2: ${hex2}`);*/
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

function ContrastAlpha({ foreground, background, isNonText }) {
  const contrast = roundedContrastAlpha(foreground, background);
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
  const [textColor, updateTextColor] = useState(colorStringToObj("#002244"));
  const [objectColor, updateObjectColor] = useState(
    colorStringToObj("#0094F0")
  );
  const [backgroundColor, updateBackgroundColor] = useState(
    colorStringToObj("#EEF9FF")
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
        <ContrastAlpha
          foreground={textColor}
          background={flattenColor(objectColor, backgroundColor)}
        />
        <br />
        Relative Luminosity Object:{" "}
        {roundedRelativeLuminance(objectColor, backgroundColor)}
        <br />
        Contrast Object–Background:{" "}
        <ContrastAlpha
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
        <ContrastAlpha foreground={textColor} background={backgroundColor} />
        <br />
        <br />
      </div>
      <div style={{ display: "flex" }}>
        <div>
          <SketchPicker
            color={textColor}
            disableAlpha={false}
            presetColors={presets}
            onChange={(color, event) => updateTextColor(color.rgb)}
          />
        </div>
        <div>
          <SketchPicker
            color={objectColor}
            disableAlpha={false}
            presetColors={presets}
            onChange={(color, event) => updateObjectColor(color.rgb)}
          />
        </div>
        <div>
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
