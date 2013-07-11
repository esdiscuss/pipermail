if (process.argv[2] !== 'if-travis' || process.env.CI) {
  var pipermail = require('../')
  var stream = pipermail('https://mail.mozilla.org/pipermail/es-discuss/')
  var month = ''
  console.log('Integration testing for each month:\n')
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
      console.log('DONE')
    })
}