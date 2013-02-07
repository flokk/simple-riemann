/**
 * Module dependencies
 */
var domain = require("domain");

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

  try {
    module.exports.__riemann = module.exports.__riemann || require("riemann");
  }
  catch(e) {
    console.error("Could not load riemann. Try adding it to the app dependencies or run\n  require('simple-riemann').__riemann = require('riemann');")
  }

  var clientDomain = domain.create();

  clientDomain.on("error", cb);

  var client;

  clientDomain.run(function() {
    client = module.exports.__riemann.createClient(options);

    clientDomain.removeAllListeners("error");
    clientDomain.on("error", function(err) {
      client.emit("error", err);
    });

    var _disconnect = client.disconnect;

    client.disconnect = function() {
      _disconnect();
      clientDomain.dispose();
    };
  });

  if(client) CACHE[options.host+options.port] = client;

  return client;
};

module.exports.__riemann;