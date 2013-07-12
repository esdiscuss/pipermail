var request = require('./graceful-request')


module.exports = readMonth;
function readMonth(url, cb) {
  url = url.replace(/\/$/, '').replace(/\/date\.html$/, '')
  request(url + '/date.html', function (err, res) {
    if (err) return cb(err)
    if (res.statusCode !== 200) {
      return cb(new Error('Status Code ' + res.statusCode + ':\n' +
                res.body.toString().replace(/^/gm, '  ')))
    }
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
    cb(null, urls)
  })
}