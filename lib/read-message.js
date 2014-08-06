'use strict'

var request = require('then-request')
var html = require('./html')

module.exports = readMessage;
function readMessage(url, options) {
  return request('GET', url, options).getBody('utf8').then(function (body) {
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
  })
}
