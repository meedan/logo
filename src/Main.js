/**
 * Project app.
 */
function Project(opts) {
  // Extend the configuration defaults using opts
  this.defaults = {
    // TODO: Put default options here
  };
  this.opts = $.extend(this.defaults, opts);
}

/**
 * Example method
 */
Project.prototype.doStuff = function () {
  if (this.opts.debug) {
    console.log("Ran..");
  }
};
