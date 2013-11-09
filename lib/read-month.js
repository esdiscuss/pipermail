'use strict'

var request = require('./graceful-request')

module.exports = readMonth;
function readMonth(url, cb) {
  url = url.replace(/\/$/, '').replace(/\/date\.html$/, '')
  return request(url + '/date.html').then(function (res) {
    var body = res.body.toString()
    var pattern = /href=\"(\d+\.html)\"/gi
    var match
    var dedupe = {}
    var urls = []
    while (match = pattern.exec(body)) {
      var u = url + '/' + match[1]
      if (!dedupe[u]) {
        urls.push(u)
        dedupe[u] = u
      }
    }
    return urls
  }).nodeify(cb)
}