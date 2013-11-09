'use strict'

var request = require('./graceful-request')

module.exports = readIndex;
function readIndex(url, cb) {
  url = url.replace(/\/$/, '')
  return request(url).then(function (res) {
    var body = res.body.toString()
    var pattern = /\d\d\d\d\-[a-z]+\.txt\.gz/gi
    var match
    var urls = []
    while (match = pattern.exec(body)) {
      urls.push(url + '/' + match[0].replace(/\.txt\.gz$/, ''))
    }
    return urls.reverse()
  }).nodeify(cb)
}