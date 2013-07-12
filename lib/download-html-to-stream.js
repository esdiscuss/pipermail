var assert = require('assert')
var Transform = require('stream').Transform || require('readable-stream').Transform
var Readable = require('stream').Readable || require('readable-stream').Readable
var promise = require('promise')

exports = (module.exports = download)
exports.readIndex = require('./read-index')
exports.readMonth = require('./read-month')
exports.readMessage = require('./read-message')

function download(src, options) {
  options = options || {}
  var maxMonths = options.months || Infinity
  assert(typeof maxMonths === 'number' && !isNaN(maxMonths) && maxMonths >= 1 && maxMonths % 1 === 0 || maxMonths === Infinity, '`months` must be a positive integer.')

  var dest = new Transform({objectMode: true})
  var queue = []
  var cb = null
  dest._transform = function (url, _, callback) {
    var download = promise.denodeify(exports.readMessage)(url.toString())
    var complete = promise.all(queue)
      .then(function () {
        return download
      })
      .then(function (message) {
        queue.shift()
        dest.push(message)
        if (cb) {
          var callback = cb
          cb = null
          callback()
        }
      }, function (err) {
        queue.shift()
        dest.emit('error', err)
        if (cb) {
          var callback = cb
          cb = null
          callback()
        }
      })
    queue.push(complete)
    if (queue.length < 10) callback()
    else cb = callback
  }
  dest._flush = function (callback) {
    promise.all(queue).nodeify(callback)
  }

  exports.readIndex(src, function (err, index) {
    if (err) return dest.emit('error', err)

    var i = Math.max(0, index.length - maxMonths)

    var source = new Readable()
    var inProgress = false
    source._read = function () {
      if (inProgress) return
      inProgress = true
      if (i === index.length) {
        return source.push(null)
      }
      exports.readMonth(index[i], function (err, month) {
        if (err) return source.emit('error', err)
        var cont = true
        for (var x = 0; x < month.length; x++) {
          cont = source.push(month[x])
        }
        i++
        inProgress = false
        if (cont) return source._read()
      })
    }
    source.on('error', function (e) {
      dest.emit('error', e)
    })
    source.pipe(dest)
  });

  return dest;
}