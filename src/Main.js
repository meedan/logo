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
    numDots: 100
  };
  this.opts = $.extend(this.defaults, opts);

  this.initCanvas(canvas);
  this.initBounds();
  this.initRasters();
  this.initDots(true, this.plotFuzzyRings);
}

Logo.prototype.initCanvas = function (canvas) {
  this.canvas = canvas;
  this.ctx    = canvas.getContext('2d');

  this.clearRender();
};

Logo.prototype.clearRender = function () {
  this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
};

Logo.prototype.clearState = function () {
  util.clearStatic(this.plotRings);
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

Logo.prototype.initDots = function (render, plottingFn) {
  var i, pos, r, a, x, y, c;

  this.dots = [];
  for (i = this.opts.numDots; i >= 0; i--) {
    pos = plottingFn.call(this);

    if (pos === false) {
      continue;
    }

    c   = Math.floor(Math.random() * this.opts.colors.length);

    this.dots.push([pos.x, pos.y, c]);

    if (render) {
      this.dotRasters[c].ctx.blendOnto(this.ctx, 'multiply', { destX: pos.x, destY: pos.y });
    }
  }
};

Logo.prototype.pointWithAngleRadius = function (a, r) {
  return {
    x: util.fround(this.bounds.cx + Math.cos(a) * r - this.opts.dotRadius),
    y: util.fround(this.bounds.cy + Math.sin(a) * r - this.opts.dotRadius)
  };
};

Logo.prototype.plotRandom = function () {
  var r = Math.floor(Math.random() * this.bounds.r),
      a = Math.random() * util.twoPI;

  return this.pointWithAngleRadius(a, r);
};

Logo.prototype.plotRings = function (factor) {
  var state = util.static(this.plotRings, 'state', { r: 0, pos: 0, total: 0 });
  var first = (state.r == 0 && state.pos == 0);

  factor = factor || 0;

  if (!first && state.pos >= state.total) {
    state.r    += 2 * this.opts.dotRadius * (1 - factor);
    state.total = Math.floor((util.twoPI * state.r) / (2 * this.opts.dotRadius) * (1 + factor));
    state.pos   = Math.random() - 0.5;
  }

  if (state.r > this.bounds.r) {
    return false; // Don't draw this point, we're out of bounds
  }

  state.a    = state.total > 0 ? state.pos / state.total * util.twoPI : 0;
  state.pos += 1;

  return this.pointWithAngleRadius(state.a, state.r);
}

Logo.prototype.plotFuzzyRings = function () {
  var pos = this.plotRings(0.1),
      fuzz = this.opts.dotRadius / 2;

  pos.x += Math.floor(Math.random() * fuzz - fuzz);
  pos.y += Math.floor(Math.random() * fuzz - fuzz);

  return pos;
}

Logo.prototype.plotTightRings = function () {
  return this.plotRings(0.3);
};

