var transform = require('transform-stream');

module.exports = stringify;
function stringify() {
  return transform(function (item, finish) {
    finish(null, JSON.stringify(item) + '\n');
  });
}