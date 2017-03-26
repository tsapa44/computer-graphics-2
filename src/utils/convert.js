/**
* EXPORTS
*/
exports.rgb_to_lab = rgb_to_lab;
exports.rgba_to_lab = rgba_to_lab;
exports.lab2rgb = lab2rgb;

/**
* IMPORTS
*/
var pow  = Math.pow;
var sqrt = Math.sqrt;

/**
 * API FUNCTIONS
 */

/**
* Returns c converted to labcolor. Uses bc as background color,
* deaults to using white as background color.
* @param {rgbacolor} c should have fields R,G,B,A
* @param {rgbcolor} b should have fields R,G,B
* @return {labcolor} c converted to labcolor
*/
function rgba_to_lab(c, bc)
{
  var bc = typeof bc !== 'undefined' ? bc : {R: 255, G: 255, B:255};
  var new_c = {R: bc.R + (c.R - bc.R) * c.A,
               G: bc.G + (c.G - bc.G) * c.A,
               B: bc.B + (c.B - bc.B) * c.A};
  return rgb_to_lab(new_c)
}

/**
* Returns c converted to labcolor.
* @param {rgbcolor} c should have fields R,G,B
* @return {labcolor} c converted to labcolor
*/
function rgb_to_lab(c)
{
  return xyz_to_lab(rgb_to_xyz(c))
}

/**
* Returns c converted to xyzcolor.
* @param {rgbcolor} c should have fields R,G,B
* @return {xyzcolor} c converted to xyzcolor
*/
function rgb_to_xyz(c)
{
  // Based on http://www.easyrgb.com/index.php?X=MATH&H=02
  var R = ( c.R / 255 );
  var G = ( c.G / 255 );
  var B = ( c.B / 255 );

  if ( R > 0.04045 ) R = pow(( ( R + 0.055 ) / 1.055 ),2.4);
  else               R = R / 12.92;
  if ( G > 0.04045 ) G = pow(( ( G + 0.055 ) / 1.055 ),2.4);
  else               G = G / 12.92;
  if ( B > 0.04045 ) B = pow(( ( B + 0.055 ) / 1.055 ), 2.4);
  else               B = B / 12.92;

  R *= 100;
  G *= 100;
  B *= 100;

  // Observer. = 2°, Illuminant = D65
  var X = R * 0.4124 + G * 0.3576 + B * 0.1805;
  var Y = R * 0.2126 + G * 0.7152 + B * 0.0722;
  var Z = R * 0.0193 + G * 0.1192 + B * 0.9505;
  return {'X' : X, 'Y' : Y, 'Z' : Z};
}

/**
* Returns c converted to labcolor.
* @param {xyzcolor} c should have fields X,Y,Z
* @return {labcolor} c converted to labcolor
*/
function xyz_to_lab(c)
{
  // Based on http://www.easyrgb.com/index.php?X=MATH&H=07
  var ref_Y = 100.000;
  var ref_Z = 108.883;
  var ref_X = 95.047; // Observer= 2°, Illuminant= D65
  var Y = c.Y / ref_Y;
  var Z = c.Z / ref_Z;
  var X = c.X / ref_X;
  if ( X > 0.008856 ) X = pow(X, 1/3);
  else                X = ( 7.787 * X ) + ( 16 / 116 );
  if ( Y > 0.008856 ) Y = pow(Y, 1/3);
  else                Y = ( 7.787 * Y ) + ( 16 / 116 );
  if ( Z > 0.008856 ) Z = pow(Z, 1/3);
  else                Z = ( 7.787 * Z ) + ( 16 / 116 );
  var L = ( 116 * Y ) - 16;
  var a = 500 * ( X - Y );
  var b = 200 * ( Y - Z );
  return {'L' : L , 'a' : a, 'b' : b};
}

function lab2rgb(lab){
  var y = (lab[0] + 16) / 116,
      x = lab[1] / 500 + y,
      z = y - lab[2] / 200,
      r, g, b;

  x = 0.95047 * ((x * x * x > 0.008856) ? x * x * x : (x - 16/116) / 7.787);
  y = 1.00000 * ((y * y * y > 0.008856) ? y * y * y : (y - 16/116) / 7.787);
  z = 1.08883 * ((z * z * z > 0.008856) ? z * z * z : (z - 16/116) / 7.787);

  r = x *  3.2406 + y * -1.5372 + z * -0.4986;
  g = x * -0.9689 + y *  1.8758 + z *  0.0415;
  b = x *  0.0557 + y * -0.2040 + z *  1.0570;

  r = (r > 0.0031308) ? (1.055 * Math.pow(r, 1/2.4) - 0.055) : 12.92 * r;
  g = (g > 0.0031308) ? (1.055 * Math.pow(g, 1/2.4) - 0.055) : 12.92 * g;
  b = (b > 0.0031308) ? (1.055 * Math.pow(b, 1/2.4) - 0.055) : 12.92 * b;

  return [Math.max(0, Math.min(1, r)) * 255,
          Math.max(0, Math.min(1, g)) * 255,
          Math.max(0, Math.min(1, b)) * 255]
}


function rgb2lab(rgb){
  var r = rgb[0] / 255,
      g = rgb[1] / 255,
      b = rgb[2] / 255,
      x, y, z;

  r = (r > 0.04045) ? Math.pow((r + 0.055) / 1.055, 2.4) : r / 12.92;
  g = (g > 0.04045) ? Math.pow((g + 0.055) / 1.055, 2.4) : g / 12.92;
  b = (b > 0.04045) ? Math.pow((b + 0.055) / 1.055, 2.4) : b / 12.92;

  x = (r * 0.4124 + g * 0.3576 + b * 0.1805) / 0.95047;
  y = (r * 0.2126 + g * 0.7152 + b * 0.0722) / 1.00000;
  z = (r * 0.0193 + g * 0.1192 + b * 0.9505) / 1.08883;

  x = (x > 0.008856) ? Math.pow(x, 1/3) : (7.787 * x) + 16/116;
  y = (y > 0.008856) ? Math.pow(y, 1/3) : (7.787 * y) + 16/116;
  z = (z > 0.008856) ? Math.pow(z, 1/3) : (7.787 * z) + 16/116;

  return [(116 * y) - 16, 500 * (x - y), 200 * (y - z)]
}

// calculate the perceptual distance between colors in CIELAB
// https://github.com/THEjoezack/ColorMine/blob/master/ColorMine/ColorSpaces/Comparisons/Cie94Comparison.cs

function deltaE(labA, labB){
  var deltaL = labA[0] - labB[0];
  var deltaA = labA[1] - labB[1];
  var deltaB = labA[2] - labB[2];
  var c1 = Math.sqrt(labA[1] * labA[1] + labA[2] * labA[2]);
  var c2 = Math.sqrt(labB[1] * labB[1] + labB[2] * labB[2]);
  var deltaC = c1 - c2;
  var deltaH = deltaA * deltaA + deltaB * deltaB - deltaC * deltaC;
  deltaH = deltaH < 0 ? 0 : Math.sqrt(deltaH);
  var sc = 1.0 + 0.045 * c1;
  var sh = 1.0 + 0.015 * c1;
  var deltaLKlsl = deltaL / (1.0);
  var deltaCkcsc = deltaC / (sc);
  var deltaHkhsh = deltaH / (sh);
  var i = deltaLKlsl * deltaLKlsl + deltaCkcsc * deltaCkcsc + deltaHkhsh * deltaHkhsh;
  return i < 0 ? 0 : Math.sqrt(i);
}

// Local Variables:
// allout-layout: t
// js-indent-level: 2
// End:
