'use strict'

var Promise = require('promise')
var request = Promise.denodeify(require('request'))

module.exports = get
function get(url, callback) {
  function recurse(attempt) {
    return request(url).then(function (res) {
      if (res.statusCode === 200) return res;
      var err = new Error('Status Code ' + res.statusCode + ':\n' +
                res.body.toString().replace(/^/gm, '  '));
      err.statusCode = res.statusCode;
      throw err;
    }).then(null, function (err) {
      if (canRetry(err) && attempt < 10) {
        console.warn('retrying attempt: ' + attempt + '\n' + err.stack)
        return delay(attempt * attempt * 100)
          .then(recurse.bind(this, attempt + 1))
      } else {
        throw err
      }
    })
  }
  return recurse(1).nodeify(callback)
}

function delay(ms) {
  return new Promise(function (resolve) {
    setTimeout(resolve, ms)
  })
}

function canRetry(err) {
  return err.code === 'EMFILE' || (err.statusCode && err.statusCode >= 500)
}
