var through = require('through');

module.exports = stringify;
function stringify() {
  return through(function (item, finish) {
    this.queue(JSON.stringify(item) + '\n');
  });
}