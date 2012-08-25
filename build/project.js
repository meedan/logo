/*jslint bitwise: true, continue: true, nomen: true, plusplus: true, todo: true, white: true, browser: true, devel: true, indent: 2 */
var Project = (function (window, $) {
  "use strict";

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

  /**
   * Project app.
   *
   * Requirements: jQuery, Paper.js
   */
  function Project(opts) {
    // Extend the configuration defaults using opts
    this.defaults = {
      // TODO: Put default options here
    };
    this.opts = $.extend(this.defaults, opts);

    // State management and helpers
    this.state = {};
    this.util = new Util();
  }

  /**
   * Draws the currently loaded data as a scatter plot.
   */
  Project.prototype.doStuff = function () {
    if (typeof this.opts.debug === 'function') {
      this.opts.debug("Doing stuff..");
    }
  };
  return Project;
}(window, jQuery));