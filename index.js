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
  if (typeof options === "function") {
    cb = options;
    options = {};
  };

  // Defaults
  options = options || {};
  options.host = options.host || process.env.RIEMANN_HOST || "127.0.0.1";
  options.port = options.port || process.env.RIEMANN_PORT || 5555;

  var cacheKey = options.host+":"+options.port;

  // Noop
  cb = cb || function(err){
    console.error("Error connecting to riemann at "+cacheKey+":", err.stack || err, "\n Try setting RIEMANN_HOST and RIEMANN_PORT");
  };

  if (CACHE[cacheKey]) return CACHE[cacheKey];

  domain.on("error", cb);

  var client;

  domain.run(function() {
    client = riemann.createClient(options);

    domain.removeAllListeners('error');
    domain.on("error", function(err) {
      delete CACHE[cacheKey];
      cb(err);
    });

    var _disconnect = client.disconnect;

    client.disconnect = function() {
      delete CACHE[cacheKey];
      _disconnect();
      domain.dispose();
    };
  });

  if(client) CACHE[cacheKey] = client;

  return client;
};
