var request = require('request')
var html = require('./html')


module.exports = readMessage;
function readMessage(url, callback) {
  request(url, function (err, res) {
    if (err) return callback(err)
    if (res.statusCode !== 200) {
      return callback(new Error('Status Code ' + res.statusCode + ':\n' +
                res.body.toString().replace(/^/gm, '  ')))
    }
    var message
    var body = res.body.toString()
    try {
      var dom = html(body)

      var header = {
        subject: dom.select(['html', 'body', 'h1']).first().textContent().trim(),
        from: {
          name: dom.select(['html', 'body', 'b']).first().textContent().trim(),
          email: dom.select(['html', 'body', 'a']).first().textContent().trim().replace(' at ', '@')
        },
        reply: dom.select(['html', 'body', 'a']).first().attr('href'),
        date: new Date(dom.select(['html', 'body', 'i']).first().textContent().trim()),
      }

      message = {
        url: url,
        header: header,
        body: dom.select(['html', 'body', 'p', 'pre']).first().textContent().trim()
      }
    } catch (ex) {
      ex.message += '\n\n\n' + body
      return callback(ex)
    }
    callback(null, message)
  })
}