/*jslint bitwise: true, continue: true, nomen: true, plusplus: true, todo: true, white: true, browser: true, devel: true, indent: 2 */
var Meedan = (function () {
  "use strict";

  // Context Blender JavaScript Library
  //
  // Copyright © 2010 Gavin Kistner
  //
  // Permission is hereby granted, free of charge, to any person obtaining a copy
  // of this software and associated documentation files (the "Software"), to deal
  // in the Software without restriction, including without limitation the rights
  // to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
  // copies of the Software, and to permit persons to whom the Software is
  // furnished to do so, subject to the following conditions:
  //
  // The above copyright notice and this permission notice shall be included in
  // all copies or substantial portions of the Software.
  //
  // THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
  // IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
  // FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
  // AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
  // LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
  // OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
  // THE SOFTWARE.
  if (window.CanvasRenderingContext2D && CanvasRenderingContext2D.prototype.getImageData){
  	var defaultOffsets = {
  		destX   : 0,
  		destY   : 0,
  		sourceX : 0,
  		sourceY : 0,
  		width   : 'auto',
  		height  : 'auto'
  	};
  	CanvasRenderingContext2D.prototype.blendOnto = function(destContext,blendMode,offsetOptions){
  		var offsets={};
  		for (var key in defaultOffsets){
  			if (defaultOffsets.hasOwnProperty(key)){
  				offsets[key] = (offsetOptions && offsetOptions[key]) || defaultOffsets[key];
  			}
  		}
  		if (offsets.width =='auto') offsets.width =this.canvas.width;
  		if (offsets.height=='auto') offsets.height=this.canvas.height;
  		offsets.width  = Math.min(offsets.width, this.canvas.width-offsets.sourceX, destContext.canvas.width-offsets.destX );
  		offsets.height = Math.min(offsets.height,this.canvas.height-offsets.sourceY,destContext.canvas.height-offsets.destY);

  		var srcD = this.getImageData(offsets.sourceX,offsets.sourceY,offsets.width,offsets.height);
  		var dstD = destContext.getImageData(offsets.destX,offsets.destY,offsets.width,offsets.height);
  		var src  = srcD.data;
  		var dst  = dstD.data;
  		var sA, dA, len=dst.length;
  		var sRA, sGA, sBA, dRA, dGA, dBA, dA2;
  		var demultiply;

  		for (var px=0;px<len;px+=4){
  			sA  = src[px+3]/255;
  			dA  = dst[px+3]/255;
  			dA2 = (sA + dA - sA*dA);
  			dst[px+3] = dA2*255;

  			sRA = src[px  ]/255*sA;
  			dRA = dst[px  ]/255*dA;
  			sGA = src[px+1]/255*sA;
  			dGA = dst[px+1]/255*dA;
  			sBA = src[px+2]/255*sA;
  			dBA = dst[px+2]/255*dA;
  			
  			demultiply = 255 / dA2;
  		
  			switch(blendMode){
  				// ******* Very close match to Photoshop
  				case 'normal':
  				case 'src-over':
  					dst[px  ] = (sRA + dRA - dRA*sA) * demultiply;
  					dst[px+1] = (sGA + dGA - dGA*sA) * demultiply;
  					dst[px+2] = (sBA + dBA - dBA*sA) * demultiply;
  				break;

  				case 'screen':
  					dst[px  ] = (sRA + dRA - sRA*dRA) * demultiply;
  					dst[px+1] = (sGA + dGA - sGA*dGA) * demultiply;
  					dst[px+2] = (sBA + dBA - sBA*dBA) * demultiply;
  				break;

  				case 'multiply':
  					dst[px  ] = (sRA*dRA + sRA*(1-dA) + dRA*(1-sA)) * demultiply;
  					dst[px+1] = (sGA*dGA + sGA*(1-dA) + dGA*(1-sA)) * demultiply;
  					dst[px+2] = (sBA*dBA + sBA*(1-dA) + dBA*(1-sA)) * demultiply;
  				break;

  				case 'difference':
  					dst[px  ] = (sRA + dRA - 2 * Math.min( sRA*dA, dRA*sA )) * demultiply;
  					dst[px+1] = (sGA + dGA - 2 * Math.min( sGA*dA, dGA*sA )) * demultiply;
  					dst[px+2] = (sBA + dBA - 2 * Math.min( sBA*dA, dBA*sA )) * demultiply;
  				break;

  				// ******* Slightly different from Photoshop, where alpha is concerned
  				case 'src-in':
  					// Only differs from Photoshop in low-opacity areas
  					dA2 = sA*dA;
  					demultiply = 255 / dA2;
  					dst[px+3] = dA2*255;
  					dst[px  ] = sRA*dA * demultiply;
  					dst[px+1] = sGA*dA * demultiply;
  					dst[px+2] = sBA*dA * demultiply;
  				break;

  				case 'plus':
  				case 'add':
  					// Photoshop doesn't simply add the alpha channels; this might be correct wrt SVG 1.2
  					dA2 = Math.min(1,sA+dA);
  					dst[px+3] = dA2*255;
  					demultiply = 255 / dA2;
  					dst[px  ] = Math.min(sRA + dRA,1) * demultiply;
  					dst[px+1] = Math.min(sGA + dGA,1) * demultiply;
  					dst[px+2] = Math.min(sBA + dBA,1) * demultiply;
  				break;

  				case 'overlay':
  					// Correct for 100% opacity case; colors get clipped as opacity falls
  					dst[px  ] = (dRA<=0.5) ? (2*src[px  ]*dRA/dA) : 255 - (2 - 2*dRA/dA) * (255-src[px  ]);
  					dst[px+1] = (dGA<=0.5) ? (2*src[px+1]*dGA/dA) : 255 - (2 - 2*dGA/dA) * (255-src[px+1]);
  					dst[px+2] = (dBA<=0.5) ? (2*src[px+2]*dBA/dA) : 255 - (2 - 2*dBA/dA) * (255-src[px+2]);

  					// http://dunnbypaul.net/blends/
  					// dst[px  ] = ( (dRA<=0.5) ? (2*sRA*dRA) : 1 - (1 - 2*(dRA-0.5)) * (1-sRA) ) * demultiply;
  					// dst[px+1] = ( (dGA<=0.5) ? (2*sGA*dGA) : 1 - (1 - 2*(dGA-0.5)) * (1-sGA) ) * demultiply;
  					// dst[px+2] = ( (dBA<=0.5) ? (2*sBA*dBA) : 1 - (1 - 2*(dBA-0.5)) * (1-sBA) ) * demultiply;

  					// http://www.barbato.us/2010/12/01/blimageblending-emulating-photoshops-blending-modes-opencv/#toc-blendoverlay
  					// dst[px  ] = ( (sRA<=0.5) ? (sRA*dRA + sRA*(1-dA) + dRA*(1-sA)) : (sRA + dRA - sRA*dRA) ) * demultiply;
  					// dst[px+1] = ( (sGA<=0.5) ? (sGA*dGA + sGA*(1-dA) + dGA*(1-sA)) : (sGA + dGA - sGA*dGA) ) * demultiply;
  					// dst[px+2] = ( (sBA<=0.5) ? (sBA*dBA + sBA*(1-dA) + dBA*(1-sA)) : (sBA + dBA - sBA*dBA) ) * demultiply;

  					// http://www.nathanm.com/photoshop-blending-math/
  					// dst[px  ] = ( (sRA < 0.5) ? (2 * dRA * sRA) : (1 - 2 * (1 - sRA) * (1 - dRA)) ) * demultiply;
  					// dst[px+1] = ( (sGA < 0.5) ? (2 * dGA * sGA) : (1 - 2 * (1 - sGA) * (1 - dGA)) ) * demultiply;
  					// dst[px+2] = ( (sBA < 0.5) ? (2 * dBA * sBA) : (1 - 2 * (1 - sBA) * (1 - dBA)) ) * demultiply;
  				break;

  				case 'hardlight':
  					dst[px  ] = (sRA<=0.5) ? (2*dst[px  ]*sRA/dA) : 255 - (2 - 2*sRA/sA) * (255-dst[px  ]);
  					dst[px+1] = (sGA<=0.5) ? (2*dst[px+1]*sGA/dA) : 255 - (2 - 2*sGA/sA) * (255-dst[px+1]);
  					dst[px+2] = (sBA<=0.5) ? (2*dst[px+2]*sBA/dA) : 255 - (2 - 2*sBA/sA) * (255-dst[px+2]);
  				break;
  				
  				case 'colordodge':
  				case 'dodge':
  					if ( src[px  ] == 255 && dRA==0) dst[px  ] = 255;
  					else dst[px  ] = Math.min(255, dst[px  ]/(255 - src[px  ])) * demultiply;

  					if ( src[px+1] == 255 && dGA==0) dst[px+1] = 255;
  					else dst[px+1] = Math.min(255, dst[px+1]/(255 - src[px+1])) * demultiply;

  					if ( src[px+2] == 255 && dBA==0) dst[px+2] = 255;
  					else dst[px+2] = Math.min(255, dst[px+2]/(255 - src[px+2])) * demultiply;
  				break;
  				
  				case 'colorburn':
  				case 'burn':
  					if ( src[px  ] == 0 && dRA==0) dst[px  ] = 0;
  					else dst[px  ] = (1 - Math.min(1, (1 - dRA)/sRA)) * demultiply;

  					if ( src[px+1] == 0 && dGA==0) dst[px+1] = 0;
  					else dst[px+1] = (1 - Math.min(1, (1 - dGA)/sGA)) * demultiply;

  					if ( src[px+2] == 0 && dBA==0) dst[px+2] = 0;
  					else dst[px+2] = (1 - Math.min(1, (1 - dBA)/sBA)) * demultiply;
  				break;
  				
  				case 'darken':
  				case 'darker':
  					dst[px  ] = (sRA>dRA ? dRA : sRA) * demultiply;
  					dst[px+1] = (sGA>dGA ? dGA : sGA) * demultiply;
  					dst[px+2] = (sBA>dBA ? dBA : sBA) * demultiply;
  				break;
  				
  				case 'lighten':
  				case 'lighter':
  					dst[px  ] = (sRA<dRA ? dRA : sRA) * demultiply;
  					dst[px+1] = (sGA<dGA ? dGA : sGA) * demultiply;
  					dst[px+2] = (sBA<dBA ? dBA : sBA) * demultiply;
  				break;

  				case 'exclusion':
  					dst[px  ] = (dRA+sRA - 2*dRA*sRA) * demultiply;
  					dst[px+1] = (dGA+sGA - 2*dGA*sGA) * demultiply;
  					dst[px+2] = (dBA+sBA - 2*dBA*sBA) * demultiply;
  				break;

  				// ******* UNSUPPORTED
  				default:
  					dst[px] = dst[px+3] = 255;
  					dst[px+1] = px%8==0 ? 255 : 0;
  					dst[px+2] = px%8==0 ? 0 : 255;
  			}
  		}
  		destContext.putImageData(dstD,offsets.destX,offsets.destY);
  	};
  	// For querying of functionality from other libraries
  	var modes = CanvasRenderingContext2D.prototype.blendOnto.supportedBlendModes = 'normal src-over screen multiply difference src-in plus add overlay hardlight colordodge dodge colorburn burn darken lighten exclusion'.split(' ');
  	var supports = CanvasRenderingContext2D.prototype.blendOnto.supports = {};
  	for (var i=0,len=modes.length;i<len;++i) supports[modes[i]] = true;
  }  // Global helper, are we running inside node.js?
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

  /**
   * Meedan Logo app.
   */
  function Logo(canvas, opts) {
    // Extend the configuration defaults using opts
    this.defaults = {
      colors: [
        '#F9CC00', // Yellow
        '#1A95DC', // Blue
        '#EA601D', // Orange
        '#A5BF27'  // Green
      ],
      dotScale: 18.5714286,
      numDots: 80
    };
    this.opts = $.extend(this.defaults, opts);

    this.initCanvas(canvas);
    this.initBounds();
    this.initRasters();
    this.initDots(true, this.packRandom);
  }

  Logo.prototype.initCanvas = function (canvas) {
    this.canvas = canvas;
    this.ctx    = canvas.getContext('2d');

    this.clearRender();
  };

  Logo.prototype.clearRender = function () {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  };

  Logo.prototype.initBounds = function () {
    var smallDim = Math.min(this.canvas.width, this.canvas.height);

    this.opts.dotRadius = smallDim / this.opts.dotScale;

    this.bounds = {
      r:  smallDim / 2 - this.opts.dotRadius,
      cx: this.canvas.width / 2,
      cy: this.canvas.height / 2
    };
  };

  Logo.prototype.initRasters = function () {
    var i, w, h, canvas, raster;

    if (isLikelyNode) {
      var Canvas = require('canvas');
    }

    w = this.opts.dotRadius * 2 + 2;
    h = this.opts.dotRadius * 2 + 2;
    this.dotRasters = [];

    for (i = this.opts.colors.length - 1; i >=0; i--) {
      if (isLikelyNode) {
        canvas = new Canvas(w, h);
      } else {
        canvas = document.createElement('canvas');
        canvas.width  = w;
        canvas.height = h;
      }

      // Render an individual coloured dot in the centre of each raster
      raster = canvas.getContext('2d');
      this.renderDot([ w / 2, h / 2, i ], raster);

      this.dotRasters.push({
        canvas: canvas,
        ctx:    raster
      });
    }
  };

  Logo.prototype.renderDot = function (dot, ctx) {
    var x = dot[0], y = dot[1], c = this.opts.colors[dot[2]];

    ctx.fillStyle = c;
    ctx.beginPath();
    ctx.arc(x, y, this.opts.dotRadius, 0, util.twoPI, true);
    ctx.fill();
  };

  Logo.prototype.initDots = function (render, packingFn) {
    var i, pos, r, a, x, y, c;

    this.dots = [];
    for (i = this.opts.numDots; i >= 0; i--) {
      pos = packingFn.call(this);
      c   = Math.floor(Math.random() * this.opts.colors.length);

      this.dots.push([pos.x, pos.y, c]);

      if (render) {
        this.dotRasters[c].ctx.blendOnto(this.ctx, 'multiply', { destX: pos.x, destY: pos.y });
      }
    }
  };

  Logo.prototype.packRandom = function () {
    var r = Math.floor(Math.random() * this.bounds.r),
        a = Math.random() * util.twoPI;

    return {
      x: util.fround(this.bounds.cx + Math.cos(a) * r - this.opts.dotRadius),
      y: util.fround(this.bounds.cy + Math.sin(a) * r - this.opts.dotRadius)
    };
  };

  Logo.prototype.packDisc = function () {
    // TODO: Disc pack algo.
  }

  Logo.prototype.doStuff = function () {
    // TODO: Stuff...
  };

  return { Logo: Logo };
}());