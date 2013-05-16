exports = module.exports = function (index, options) {
  var src = exports.downloadToStream(index, options);
  var dest = exports.parseStream();
  src.pipe(dest);
  scr.on('error', function (err) {
    dest.emit('error', err);
  });
  return dest;
};

exports.parseIndex = require('./parse-index');

exports.downloadToStream = require('./download-to-stream');
exports.parseStream = require('./parse-stream');

exports.downloadToDirectory = require('./download-to-directory');
exports.stringify = require('./stringify');