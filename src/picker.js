import React, { useState } from "react";
import { Link } from "react-router-dom";
import { SketchPicker } from "react-color";
import getRelativeLuminance from "get-relative-luminance";
import chroma from "chroma-js";
import SAPCbasic from "./sapc";

const hexContrastCheck = require("wcag-contrast").hex;

const presetDefaults = ["#002244", "#0094F0", "#EEF9FF"];

const objWhite = { r: 255, g: 255, b: 255, a: 1 };

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
    a: chroma(rgba).alpha()
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
    .mix(objToRgb(background), objToRgb(foreground), foreground.a, "rgb")
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
      <ContrastSapc
        foreground={flattenColor(foreground, background)}
        background={background}
        isNonText={isNonText}
      />
    </div>
  );
}

function ContrastSapc({ foreground, background, isNonText }) {
  const sapc = SAPCbasic(
    background.r,
    background.g,
    background.b,
    foreground.r,
    foreground.g,
    foreground.b
  );

  return (
    <div
      style={{
        fontSize: 13,
        lineHeight: 1.05,
        display: "inline",
        fontWeight: "normal",
        padding: 4,
        float: "right",
        textAlign: "right",
        color: "black"
      }}
    >
      {sapc}{" "}
      <span
        style={{
          color: isNonText
            ? Math.abs(parseInt(sapc, 10)) >= 65
              ? "rgb(0, 160, 0)"
              : "rgb(180, 0, 0)"
            : Math.abs(parseInt(sapc, 10)) >= 70
            ? "rgb(0, 160, 0)"
            : Math.abs(parseInt(sapc, 10)) >= 65
            ? "rgb(200, 160, 0)"
            : "rgb(200, 0, 0)"
        }}
      >
        ■
      </span>
      <br />
      <span style={{ fontSize: ".75em" }}>
        <span role="img" aria-label="caution">
          ⚠️
        </span>{" "}
        <a
          style={{ color: "inherit" }}
          href="https://github.com/w3c/wcag/issues/695"
        >
          SAPC
        </a>{" "}
        Beta
      </span>
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
  queryString = props.swatches.length
    ? queryString + "/" + props.swatches.join("/")
    : queryString;

  return (
    <div
      className="canvas"
      style={{
        backgroundColor: objToRgba(backgroundColor)
      }}
    >
      <div className="layout">
        <div className="examples">
          <div className="example--control">
            <div
              style={{
                backgroundColor: objToRgba(objectColor),
                color: objToRgba(textColor)
              }}
            >
              Text on Control
            </div>
            <small style={{ display: "block", textAlign: "left" }}>
              <span role="img" aria-label="caution">
                ⚠️
              </span>{" "}
              Button boundaries are not required mandatorily to fulfill these
              contrast criteria.{" "}
              <a href="https://www.w3.org/WAI/WCAG21/Understanding/non-text-contrast#intent">
                Learn more about Non-Text Contrast.
              </a>{" "}
              Better examples might be slider bars and knobs, switches, toggles
              and other controls that need more graphical cues to work than a
              text label or icon alone.
            </small>
          </div>
          <div className="card-info">
            <div className="card-title">Contrast Text on Control</div>
            <div className="small-print">
              Text ↔︎ Control on Background on White.
              <br />
              Relative Luminosity Text:{" "}
              {roundedRelativeLuminance(
                textColor,
                flattenColor(
                  objectColor,
                  flattenColor(backgroundColor, objWhite)
                )
              )}
            </div>
            <Contrast
              foreground={textColor}
              background={flattenColor(
                objectColor,
                flattenColor(backgroundColor, objWhite)
              )}
            />

            <div className="card-title">Contrast Control</div>
            <div className="small-print">
              Control ↔︎ Background on White.
              <br />
              Relative Luminosity Control:{" "}
              {roundedRelativeLuminance(
                objectColor,
                flattenColor(backgroundColor, objWhite)
              )}
            </div>
            <Contrast
              foreground={objectColor}
              background={flattenColor(backgroundColor, objWhite)}
              isNonText
            />
          </div>
        </div>
        <div className="examples">
          <div
            className="example--text"
            style={{
              color: objToRgba(textColor)
            }}
          >
            <p className="larger">Large text on background</p>
            <p>
              Regular text on background. AA Large applies to text with a font
              size of at least 24px or larger and regular font weight as well as
              text which is …{" "}
            </p>
            <p className="bolder">larger than 18.5px and bold.</p>
          </div>
          <div className="card-info">
            <div className="card-title">Contrast Text</div>
            <div className="small-print">
              Text ↔︎ Background on White.
              <br />
              Relative Luminosity Background:{" "}
              {roundedRelativeLuminance(backgroundColor, objWhite)}
            </div>
            <Contrast
              foreground={textColor}
              background={flattenColor(backgroundColor, objWhite)}
            />
          </div>
        </div>
        <div className="picker-layout">
          <div className="picker-wrapper">
            <div
              className="picker-label"
              style={{
                color:
                  roundedRelativeLuminance(backgroundColor, objWhite) > 0.17
                    ? "#000"
                    : "#FFF"
              }}
            >
              Text Color
            </div>
            <SketchPicker
              color={textColor}
              disableAlpha={false}
              presetColors={presets}
              onChange={(color, event) => updateTextColor(color.rgb)}
            />
          </div>
          <div className="picker-wrapper">
            <div
              className="picker-label"
              style={{
                color:
                  roundedRelativeLuminance(backgroundColor, objWhite) > 0.17
                    ? "#000"
                    : "#FFF"
              }}
            >
              Control Color
            </div>
            <SketchPicker
              color={objectColor}
              disableAlpha={false}
              presetColors={presets}
              onChange={(color, event) => updateObjectColor(color.rgb)}
            />
          </div>
          <div className="picker-wrapper">
            <div
              className="picker-label"
              style={{
                color:
                  roundedRelativeLuminance(backgroundColor, objWhite) > 0.17
                    ? "#000"
                    : "#FFF"
              }}
            >
              Background Color
            </div>
            <SketchPicker
              color={backgroundColor}
              disableAlpha={false}
              presetColors={presets}
              onChange={(color, event) => updateBackgroundColor(color.rgb)}
            />
          </div>
        </div>
        <Link
          className="button"
          to={{
            pathname: queryString
          }}
        >
          Copy to URI
        </Link>
      </div>
    </div>
  );
}
