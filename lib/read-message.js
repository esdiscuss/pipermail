'use strict'

var request = require('./graceful-request')
var html = require('./html')

module.exports = readMessage;
function readMessage(url, callback) {
  return request(url).then(function (res) {
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

      return {
        url: url,
        header: header,
        body: dom.select(['html', 'body', 'p', 'pre']).first().textContent().trim()
      }
    } catch (ex) {
      ex.message += '\n\n\n' + body
      throw ex
    }
  }).nodeify(callback)
}