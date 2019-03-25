import React, { useState } from "react";
import { Link } from "react-router-dom";
import { SketchPicker } from "react-color";
import getRelativeLuminance from "get-relative-luminance";
import chroma from "chroma-js";

const hexContrastCheck = require("wcag-contrast").hex;

const presetDefaults = ["#002244", "#0094F0", "#EEF9FF"];

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
    chroma.valid(props.foreground)
      ? colorStringToObj(chroma(props.foreground).css())
      : colorStringToObj(presetDefaults[0])
  );
  const [objectColor, updateObjectColor] = useState(
    chroma.valid(props.object)
      ? colorStringToObj(chroma(props.object).css())
      : colorStringToObj(presetDefaults[1])
  );
  const [backgroundColor, updateBackgroundColor] = useState(
    chroma.valid(props.background)
      ? colorStringToObj(chroma(props.background).css())
      : colorStringToObj(presetDefaults[2])
  );

  let presets = [];

  [props.foreground, props.object, props.background, ...props.swatches].forEach(
    value => {
      if (chroma.valid(value) && !presets.includes(chroma(value).hex())) {
        presets.push(chroma(value).hex());
      }
    }
  );

  if (presets.length === 0) {
    presets = presetDefaults;
  }

  let queryString = `/${objToHex(textColor)}/${objToHex(
    objectColor
  )}/${objToHex(backgroundColor)}`;

  return (
    <div
      style={{
        lineHeight: "1.5",
        padding: "2em",
        backgroundColor: objToRgb(backgroundColor),
      }}
    >
      <div
        style={{ display: "flex", flexWrap: "wrap", justifyContent: "center" }}
      >
        <div
          style={{
            width: "50%",
          }}
        >
          <div
            style={{
              padding: "1em 2em",
              backgroundColor: objToRgba(objectColor),
              color: objToRgba(textColor),
              display: "inline-block",
              borderRadius: "4px",
            }}
          >
            Test
          </div>
        </div>
        <div
          style={{
            fontSize: ".85em",
            margin: "1em",
            textAlign: "left",
          }}
        >
          Relative Luminosity Text on Control on Background:{" "}
          {roundedRelativeLuminance(
            textColor,
            flattenColor(objectColor, backgroundColor)
          )}
          <br />
          Contrast Text on Object on Background:{" "}
          <Contrast
            foreground={textColor}
            background={flattenColor(objectColor, backgroundColor)}
          />
          <br />
          Relative Luminosity Control on Background:{" "}
          {roundedRelativeLuminance(objectColor, backgroundColor)}
          <br />
          Contrast Control on Background:{" "}
          <Contrast
            foreground={objectColor}
            background={backgroundColor}
            isNonText
          />
        </div>
      </div>
      <div
        style={{ display: "flex", flexWrap: "wrap", justifyContent: "center" }}
      >
        <div style={{ fontSize: "2em", width: "50%", textAlign: "center" }}>
          <p>Lorem ipsum …</p>
        </div>
        <div
          style={{
            color: objToRgba(textColor),
            fontSize: ".85em",
            margin: "1em",
            textAlign: "left",
          }}
        >
          <br />
          Relative Luminosity Background:{" "}
          {roundedRelativeLuminance(backgroundColor)}
          <br />
          Contrast Text on Background Background:{" "}
          <Contrast foreground={textColor} background={backgroundColor} />
          <br />
          <br />
        </div>
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
      <Link
        style={{
          color: "#000",
          fontSize: ".85em",
          textDecoration: "none",
          backgroundColor: "rgba(255,255,255,.6)",
          padding: "calc(1em + 2px) 2em 1em 2em",
          margin: "3em 2em 2em",
          display: "inline-block",
          borderRadius: "2em",
          boxShadow:
            "0 1px 2px 0 rgba(0,0,0,.1), 0 2px 4px 0 rgba(0,0,0,.1), inset 0 2px 1px 0 rgba(255,255,255,.8)",
        }}
        to={{
          pathname: queryString,
        }}
      >
        Save in URL
      </Link>
    </div>
  );
}
