if (process.argv[2] !== 'if-travis' || process.env.CI) {
  var pipermail = require('../')
  var stream = pipermail('https://mail.mozilla.org/pipermail/es-discuss/')

  stream
    .on('error', function (e) { throw e })
    .on('data', function (message) {
      console.dir(message.url)
    })
    .on('end', function () {
      console.log('DONE')
    })
}