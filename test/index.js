var riemann = require("..");

var client = riemann(function(err) {
  console.error(err);
});

console.log(client);
