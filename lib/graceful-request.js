var request = require('request')

module.exports = graceful
function graceful(url, callback, attempt) {
  attempt = attempt || 1
  request(url, function (err, res) {
    if (err && err.code === 'EMFILE' && attempt < 10) {
      console.warn('EMFILE')
      setTimeout(function () {
        graceful(url, callback, attempt + 1)
      }, attempt * attempt * 100)
    } else {
      callback(err, res)
    }
  })
}