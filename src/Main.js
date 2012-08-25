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
