var Transform = require('stream').Transform || require('readable-stream').Transform
var Readable = require('stream').Readable || require('readable-stream').Readable

var readIndex = require('./read-index')
var readMonth = require('./read-month')
var readMessage = require('./read-message')

module.exports = download;
function download(src, options) {

  var dest = new Transform({objectMode: true})

  dest._transform = function (url, _, callback) {
    readMessage(url.toString(), function (err, message) {
      if (err) return callback(err)
      dest.push(message)
      callback()
    })
  }

  readIndex(src, function (err, index) {
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
      readMonth(index[i], function (err, month) {
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