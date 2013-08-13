var Transform = require('barrage').Transform
var jsesc = require('jsesc')

module.exports = stringify;
function stringify() {
  var stream = new Transform({objectMode: true})
  var first = true
  stream._transform = function (item, _, cb) {
    stream.push((first ? '' : '\n') + jsesc(item, {json: true}))
    first = false
    cb()
  }
  return stream
}