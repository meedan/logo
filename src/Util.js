/**
 * Project helpers
 */
function Util() {
  this._180ByPi = 180 / Math.PI;
  this._PiBy180 = Math.PI / 180;
};

Util.prototype.radiansToDegrees = function (r) {
  return r * this._180ByPi;
};

Util.prototype.degreesToRadians = function (d) {
  return d * this._PiBy180;
};

/**
 * Fast number rounding, see http://www.html5rocks.com/en/tutorials/canvas/performance/
 */
Util.prototype.fround = function (num) {
  return (0.5 + num) << 0;
};

Util.prototype.log10 = function (n) {
  return Math.log(n) / Math.LN10;
};

/**
 * Formats numbers with comma as thousands separator
 * @see http://stackoverflow.com/a/2901298/806988
 */
Util.prototype.formatCommas = function (n) {
  return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

/**
 * Helper for measuring text.
 *
 * @param "string" string
 *  The text to be measured
 * @param "object" style
 *  Optionally, CSS style for the string.
 */
Util.prototype.measure = function (string, style) {
  var $div = $('<div></div>')
               .appendTo('html')
               .css({
                      position:   "absolute",
                      left:       -1000,
                      top:        -1000,
                      height:     "auto",
                      width:      "auto"
                    });

  $div.text(string);

  if (typeof style === 'object') {
    $div.css(style);
  }

  return {
           width:  $div.outerWidth(),
           height: $div.outerHeight()
         };
};

