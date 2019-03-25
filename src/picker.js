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
  return (
    <div
      className={
        level === "fail"
          ? "evaluation fail"
          : level === "AA Large"
          ? "evaluation large"
          : "evaluation success"
      }
    >
      {level}
    </div>
  );
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
    <div className="contrast-info">
      {contrast}:1
      <Evaluation level={level} />
    </div>
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

  let queryString = `/${objToHex(textColor).substring(1)}/${objToHex(
    objectColor
  ).substring(1)}/${objToHex(backgroundColor).substring(1)}`;

  return (
    <div
      className="canvas"
      style={{
        backgroundColor: objToRgb(backgroundColor),
      }}
    >
      <div className="layout">
        <div className="examples">
          <div className="example--control">
            <div
              style={{
                backgroundColor: objToRgba(objectColor),
                color: objToRgba(textColor),
              }}
            >
              Text on Control
            </div>
          </div>
          <div className="card--info">
            <div>Contrast Text on Control on Background</div>
            <Contrast
              foreground={textColor}
              background={flattenColor(objectColor, backgroundColor)}
            />
            <div className="small-print">
              Relative Luminosity Text on Control on Background:{" "}
              {roundedRelativeLuminance(
                textColor,
                flattenColor(objectColor, backgroundColor)
              )}
            </div>
            <br />
            <div>Contrast Control on Background</div>
            <Contrast
              foreground={objectColor}
              background={backgroundColor}
              isNonText
            />
            <div className="small-print">
              Relative Luminosity Control on Background:{" "}
              {roundedRelativeLuminance(objectColor, backgroundColor)}
            </div>
          </div>
        </div>
        <div className="examples">
          <div
            className="example--text"
            style={{
              color: objToRgba(textColor),
            }}
          >
            <p>Lorem ipsum …</p>
          </div>
          <div className="card--info">
            <div>Contrast Text on Background</div>
            <Contrast foreground={textColor} background={backgroundColor} />
            <div className="small-print">
              Relative Luminosity Background:{" "}
              {roundedRelativeLuminance(backgroundColor)}
            </div>
          </div>
        </div>
        <div className="picker-layout">
          <div className="picker-wrapper">
            <div class="picker-label">Text Color</div>
            <SketchPicker
              color={textColor}
              disableAlpha={false}
              presetColors={presets}
              onChange={(color, event) => updateTextColor(color.rgb)}
            />
          </div>
          <div className="picker-wrapper">
            <div class="picker-label">Control Color</div>
            <SketchPicker
              color={objectColor}
              disableAlpha={false}
              presetColors={presets}
              onChange={(color, event) => updateObjectColor(color.rgb)}
            />
          </div>
          <div className="picker-wrapper">
            <div class="picker-label">Background Color</div>
            <SketchPicker
              color={backgroundColor}
              disableAlpha={true}
              presetColors={presets}
              onChange={(color, event) => updateBackgroundColor(color.rgb)}
            />
          </div>
        </div>
        <Link
          className="button"
          to={{
            pathname: queryString,
          }}
        >
          Copy to URI
        </Link>
      </div>
    </div>
  );
}
