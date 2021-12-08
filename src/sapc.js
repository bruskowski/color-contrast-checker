///// CONSTANTS USED IN THIS VERSION ///////////////////////////////////////////

const sRGBtrc = 2.218 // Gamma for sRGB linearization. 2.223 could be used instead
// 2.218 sets unity with the piecewise sRGB at #777

const Rco = 0.2126 // sRGB Red Coefficient
const Gco = 0.7156 // sRGB Green Coefficient
const Bco = 0.0722 // sRGB Blue Coefficient

const scaleBoW = 161.8 // Scaling for dark text on light (phi * 100)
const scaleWoB = 161.8 // Scaling for light text on dark — same as BoW, but
// this is separate for possible future use.

const normBGExp = 0.38 // Constants for Power Curve Exponents.
const normTXTExp = 0.43 // One pair for normal text,and one for REVERSE
const revBGExp = 0.5 // FUTURE: These will eventually be dynamic
const revTXTExp = 0.43 // as a function of light adaptation and context

const blkThrs = 0.02 // Level that triggers the soft black clamp
const blkClmp = 1.33 // Exponent for the soft black clamp curve

///// Ultra Simple Basic Bare Bones SAPC Function //////////////////////////////

// This REQUIRES linearized R,G,B values of 0.0-1.0

export default function SAPCbasic(Rbg, Gbg, Bbg, Rtxt, Gtxt, Btxt) {
  Rbg = Math.pow(Rbg / 255.0, sRGBtrc)
  Gbg = Math.pow(Gbg / 255.0, sRGBtrc)
  Bbg = Math.pow(Bbg / 255.0, sRGBtrc)
  Rtxt = Math.pow(Rtxt / 255.0, sRGBtrc)
  Gtxt = Math.pow(Gtxt / 255.0, sRGBtrc)
  Btxt = Math.pow(Btxt / 255.0, sRGBtrc)

  var SAPC = 0.0

  // Find Y by applying coefficients and sum.
  // This REQUIRES linearized R,G,B 0.0-1.0

  var Ybg = Rbg * Rco + Gbg * Gco + Bbg * Bco
  var Ytxt = Rtxt * Rco + Gtxt * Gco + Btxt * Bco

  /////	INSERT COLOR MODULE HERE	/////

  // Now, determine polarity, soft clamp black, and calculate contrast
  // Finally scale for easy to remember percentages
  // Note that reverse (white text on black) intentionally
  // returns a negative number

  if (Ybg > Ytxt) {
    ///// For normal polarity, black text on white

    // soft clamp darkest color if near black.
    Ytxt = Ytxt > blkThrs ? Ytxt : Ytxt + Math.abs(Ytxt - blkThrs) ** blkClmp
    SAPC = (Ybg ** normBGExp - Ytxt ** normTXTExp) * scaleBoW

    return SAPC < 15 ? "0%" : SAPC.toPrecision(3) + "%"
  } else {
    ///// For reverse polarity, white text on black

    Ybg = Ybg > blkThrs ? Ybg : Ybg + Math.abs(Ybg - blkThrs) ** blkClmp
    SAPC = (Ybg ** revBGExp - Ytxt ** revTXTExp) * scaleWoB

    return SAPC > -15 ? "0%" : SAPC.toPrecision(3) + "%"
  }

  // If SAPC's more than 15%, return that value, otherwise clamp to zero
  // this is to remove noise and unusual behavior if the user inputs
  // colors too close to each other.
  // This will be more important with future modules. Nevertheless
  // In order to simplify code, SAPC will not report accurate contrasts
  // of less than approximately 15%, so those are clamped.
  // 25% is the "point of invisibility" for many people.
}
