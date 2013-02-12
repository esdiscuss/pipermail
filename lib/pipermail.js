var transform = require('transform-stream');

exports = module.exports = function (index, options) {
  return exports.downloadToStream(index, options).pipe(exports.parseStream());
};

exports.parseIndex = require('./parse-index');

exports.downloadToStream = require('./download-to-stream');
exports.parseStream = require('./parse-stream');

exports.downloadToDirectory = require('./download-to-directory');
exports.stringify = require('./stringify');