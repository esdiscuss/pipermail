'use strict'

var request = require('then-request')

module.exports = readMonth;
function readMonth(url, options) {
  url = url.replace(/\/$/, '').replace(/\/date\.html$/, '')
  return request('GET', url + '/date.html', options).getBody('utf8').then(function (body) {
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
  })
}
