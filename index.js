/**
 * Module dependencies
 */
var riemann = require("riemann")
  , domain = require("domain").create();

/**
 * Cache the clients
 * @api private
 */
var CACHE = {};

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
  options.host = options.host || process.env.RIEMANN_HOST || "127.0.0.1";
  options.port = options.port || process.env.RIEMANN_PORT || 5555;

  if (CACHE[options.host+options.port]) return CACHE[options.host+options.port];

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

  if(client) CACHE[options.host+options.port] = client;

  return client;
};
