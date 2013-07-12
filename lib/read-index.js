var request = require('./graceful-request')


module.exports = readIndex;
function readIndex(url, cb) {
  url = url.replace(/\/$/, '')
  request(url, function (err, res) {
    if (err) return cb(err)
    if (res.statusCode !== 200) {
      return cb(new Error('Status Code ' + res.statusCode + ':\n' +
                res.body.toString().replace(/^/gm, '  ')))
    }
    var body = res.body.toString()
    var pattern = /\d\d\d\d\-[a-z]+\.txt\.gz/gi
    var match
    var urls = []
    while (match = pattern.exec(body)) {
      urls.push(url + '/' + match[0].replace(/\.txt\.gz$/, ''))
    }
    cb(null, urls.reverse())
  })
}