var fromStream = require('./lib/download-html-to-stream')
exports = (module.exports = function (path, options) { return fromStream(path, options) })

exports.readIndex = require('./lib/read-index')
exports.readMonth = require('./lib/read-month')
exports.readMessage = require('./lib/read-message')

exports.stringify = require('./lib/stringify')