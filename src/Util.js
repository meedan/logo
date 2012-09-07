// Global helper, are we running inside node.js?
var isLikelyNode = typeof Buffer !== "undefined" && typeof window === "undefined";

/**
 * Meedan Logo helpers
 */
function Util() {
  this._180ByPi = 180 / Math.PI;
  this._PiBy180 = Math.PI / 180;
  this.twoPI    = Math.PI * 2;
};

// Globally available Util instance
var util = new Util();

/**
 * Recursively merge properties of two objects 
 *
 * see: http://stackoverflow.com/a/383245/806988
 */
Util.prototype.extend = function (obj1, obj2) {
  for (var p in obj2) {
    try {
      // Property in destination object set; update its value.
      if (obj2[p].constructor === Object) {
        obj1[p] = this.extend(obj1[p], obj2[p]);
      } else {
        obj1[p] = obj2[p];
      }
    } catch(e) {
      // Property in destination object not set; create it and set its value.
      obj1[p] = obj2[p];
    }
  }

  return obj1;
}

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
 * Helper for measuring text.
 *
 * @param "string" string
 *  The text to be measured
 * @param "object" style
 *  Optionally, CSS style for the string.
 */
Util.prototype.measure = function (string, style) {
  var dim;

  if (!this.measure.ctx) {
    if (isLikelyNode) {
      var Canvas = require('canvas');
      this.measure.canvas = new Canvas(200, 50);
    } else {
      this.measure.canvas = document.createElement('canvas');
      this.measure.canvas.width = 200;
      this.measure.canvas.height = 50;
    }

    this.measure.ctx = this.measure.canvas.getContext('2d');
  }

  this.measure.ctx.font = style.fontSize + 'px ' + style.fontFamily;

  dim = this.measure.ctx.measureText(string);

  return {
           width:  dim.width,
           height: style.fontSize * 1.5 // FIXME: Hack, need to properly measure height here.
         };
};

/**
 * Returns all data attributes for an HTML element.
 *
 * see: http://stackoverflow.com/questions/4187032/get-list-of-data-attributes-using-javascript-jquery
 */
Util.prototype.dataAttributes = function (node) {
  var i, attr, key,
      d = {}, 
      re_dataAttr = /^data\-(.+)$/;

  // Fail safely
  if (typeof node !== 'object' || !node) {
    return {};
  }

  for (i in node.attributes) {
    if (node.attributes.hasOwnProperty(i)) {
      attr = node.attributes[i];

      if (re_dataAttr.test(attr.nodeName)) {
        key = attr.nodeName.match(re_dataAttr)[1];
        d[key] = attr.nodeValue;
      }
    }
  }

  return d;
};

