import React, { useState } from "react";
import { SketchPicker } from "react-color";
import getRelativeLuminance from "get-relative-luminance";
import chroma from "chroma-js";

const hexContrastCheck = require("wcag-contrast").hex;
const rgbContrastCheck = require("wcag-contrast").rgb;

const presets = ["#002244", "#0094F0", "#EEF9FF"];

const roundedRelativeLuminance = rgba => {
  const decimals = 2;
  return (
    Math.round(
      getRelativeLuminance(`rgb(${rgba.r}, ${rgba.g}, ${rgba.b})`) *
        Math.pow(10, decimals)
    ) / Math.pow(10, decimals)
  );
};

const flattenColor = (rgba1, rgba2) => {
  console.log(
    `input flattenColor: rgba(${rgba1.r},${rgba1.g},${rgba1.b},${
      rgba1.a
    }) + rgba(${rgba2.r},${rgba2.g},${rgba2.b},${rgba2.a})`
  );

  const flatColor = chroma
    .mix(
      `rgb(${rgba2.r}, ${rgba2.g}, ${rgba2.b})`,
      `rgb(${rgba1.r}, ${rgba1.g}, ${rgba1.b})`,
      rgba1.a
    )
    .css();

  console.log("flattened RGB:" + flatColor);
  console.log("flattened Hex:" + chroma(flatColor).hex());
  return chroma(flatColor).hex();
};

const roundedContrastAlpha = (rgba1, rgba2) => {
  console.log("rounded Arg1: " + rgba1);
  const hex1 = flattenColor(rgba1, rgba2);
  const hex2 = chroma(`rgb(${rgba2.r}, ${rgba2.g}, ${rgba2.b})`).hex();
  console.log(`hex1: ${hex1} – hex2: ${hex2}`);
  const decimals = 2;
  return (
    Math.round(hexContrastCheck(hex1, hex2) * Math.pow(10, decimals)) /
    Math.pow(10, decimals)
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

function ContrastAlpha({ rgba1, rgba2, isNonText }) {
  const contrast = roundedContrastAlpha(rgba1, rgba2);
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
  const [textColor, updateTextColor] = useState({
    r: chroma("#002244").get("rgb.r"),
    g: chroma("#002244").get("rgb.g"),
    b: chroma("#002244").get("rgb.b"),
    a: 1,
  });
  const [objectColor, updateObjectColor] = useState({
    r: chroma("#0094F0").get("rgb.r"),
    g: chroma("#0094F0").get("rgb.g"),
    b: chroma("#0094F0").get("rgb.b"),
    a: 1,
  });
  const [backgroundColor, updateBackgroundColor] = useState({
    r: chroma("#EEF9FF").get("rgb.r"),
    g: chroma("#EEF9FF").get("rgb.g"),
    b: chroma("#EEF9FF").get("rgb.b"),
    a: 1,
  });

  return (
    <div
      style={{
        lineHeight: "1.5",
        padding: "2em",
        backgroundColor: `rgba(${backgroundColor.r},${backgroundColor.g},${
          backgroundColor.b
        },${backgroundColor.a})`,
      }}
    >
      <div
        style={{
          padding: "1em",
          backgroundColor: `rgba(${objectColor.r},${objectColor.g},${
            objectColor.b
          },${objectColor.a})`,
          color: `rgba(${textColor.r},${textColor.g},${textColor.b},${
            textColor.a
          })`,
          display: "inline-block",
        }}
      >
        Relative Luminosity Text: {roundedRelativeLuminance(textColor)}
        <br />
        Contrast Text–Object:{" "}
        <ContrastAlpha rgba1={textColor} rgba2={objectColor} />
        <br />
        Relative Luminosity Object: {roundedRelativeLuminance(objectColor)}
        <br />
        Contrast Object–Background:{" "}
        <ContrastAlpha rgba1={objectColor} rgba2={backgroundColor} isNonText />
      </div>
      <div
        style={{
          padding: "1em",
          color: `rgba(${textColor.r},${textColor.g},${textColor.b},${
            textColor.a
          })`,
        }}
      >
        <br />
        Relative Luminosity Background:{" "}
        {roundedRelativeLuminance(backgroundColor)}
        <br />
        Contrast Text–Background:{" "}
        <ContrastAlpha rgba1={textColor} rgba2={backgroundColor} />
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
