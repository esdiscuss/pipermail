var request = require('request');


module.exports = parseIndex;
function parseIndex(url, cb) {
  request.get(url, function (err, res) {
    if (err) return cb(err);
    if (res.statusCode !== 200) {
      return cb(new Error('Status Code ' + res.statusCode + ':\n' +
                res.body.toString().replace(/^/g, '  ')));
    }
    var body = res.body.toString();
    var pattern = /\d\d\d\d\-[a-z]+\.txt\.gz/gi;
    var match;
    var urls = [];
    while (match = pattern.exec(body)) {
      urls.push(url + match[0]);
    }
    cb(null, urls.reverse());
  });
}