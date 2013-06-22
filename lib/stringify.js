var Transform = require('stream').Transform || require('readable-stream').Transform

module.exports = stringify;
function stringify() {
  var stream = new Transform({objectMode: true})
  var first = true
  stream._transform = function (item, _, cb) {
    stream.push((first ? '' : '\n') + JSON.stringify(item))
    first = false
    cb()
  }
  return stream
}