'use strict'

var request = require('then-request')

module.exports = readIndex;
function readIndex(url, options) {
  url = url.replace(/\/$/, '')
  return request('GET', url, options).getBody('utf8').then(function (body) {
    var pattern = /\d\d\d\d\-[a-z]+\.txt(?:\.gz)?/gi
    var match
    var urls = []
    while (match = pattern.exec(body)) {
      urls.push(url + '/' + match[0].replace(/\.txt(?:\.gz)?/, ''))
    }
    return urls.reverse()
  })
}
