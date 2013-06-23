var Transform = require('stream').Transform || require('readable-stream').Transform
var Readable = require('stream').Readable || require('readable-stream').Readable


exports = (module.exports = download)
exports.readIndex = require('./read-index')
exports.readMonth = require('./read-month')
exports.readMessage = require('./read-message')

function download(src, options) {

  var dest = new Transform({objectMode: true})

  dest._transform = function (url, _, callback) {
    exports.readMessage(url.toString(), function (err, message) {
      if (err) return callback(err)
      dest.push(message)
      callback()
    })
  }

  exports.readIndex(src, function (err, index) {
    if (err) return dest.emit('error', err)

    var i = 0

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