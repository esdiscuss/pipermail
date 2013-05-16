var assert = require('assert')

var pipermail = require('../')

/*
exports = module.exports = function (index, options) {
  return exports.downloadToStream(index, options).pipe(exports.parseStream());
};

exports.parseIndex = require('./parse-index');

exports.downloadToStream = require('./download-to-stream');
exports.parseStream = require('./parse-stream');

exports.downloadToDirectory = require('./download-to-directory');
exports.stringify = require('./stringify');
*/

describe('pipermail.parseIndex', function () {
  it('parses the index', function (done) {
    this.slow(4000)
    this.timeout(8000)
    pipermail.parseIndex('https://mail.mozilla.org/pipermail/es-discuss/', function (err, res) {
      if (err) return done(err)
      assert(Array.isArray(res))
      assert(res.length > 10)
      assert(res.every(function (url) { return typeof url === 'string' }))
      done()
    })
  })
})