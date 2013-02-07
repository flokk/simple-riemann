/**
 * Module dependencies
 */
var riemann = require("riemann")
  , domain = require("domain").create();

/**
 * Simple Riemann Client
 *
 * @param {Object|Function} options
 * @param {Function} cb
 * @return {RiemannClient}
 */
module.exports = function(options, cb) {
  if (typeof options === "function" || typeof options === "undefined") {
    cb = options || function(){};
    options = {};
  };

  // Defaults
  options.host = options.host || process.env.RIEMANN_HOST;
  options.port = options.port || process.env.RIEMANN_PORT;

  domain.on("error", cb);

  var client;

  domain.run(function() {
    client = riemann.createClient(options);

    domain.removeAllListeners("error");
    domain.on("error", function(err) {
      client.emit("error", err);
    });

    var _disconnect = client.disconnect;

    client.disconnect = function() {
      _disconnect();
      domain.dispose();
    };
  });

  return client;
};
