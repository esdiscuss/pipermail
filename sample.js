var pipermail = require('./');

//`pipermail` returns a stream of JSON objects.
//This can't be directly written to a file
var parsed = pipermail('https://mail.mozilla.org/pipermail/es-discuss/');

//convert the stream of json objects into a stream of JSON text seperated by new lines.
var stringified = parsed.pipe(pipermail.stringify());

//pipe to a file
stringified.pipe(require('fs').createWriteStream('res.txt'));

//compress to a file
stringified
  .pipe(require('zlib').createGzip())
  .pipe(require('fs').createWriteStream('res.txt.gz'));
