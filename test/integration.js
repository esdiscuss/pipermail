var months = Infinity
if (process.argv[2]) months = +process.argv[2]
var pipermail = require('../')
var stream = pipermail('https://mail.mozilla.org/pipermail/es-discuss/', {months: months})
var month = ''
console.log('Integration testing for ' + (months === Infinity ? 'all' : months) + ' month' + (months > 1 ? 's': '') + ':\n')
stream
  .on('error', function (e) { throw e })
  .on('data', function (message) {
    var m = /\/(\d\d\d\d-[A-Z][a-z]*)\//.exec(message.url)[1]
    if (m !== month) {
      console.log(' - ' + m)
      month = m
    }
  })
  .on('end', function () {
    console.log('\nDONE')
  })