var assert = require('assert')
var fs = require('fs')

var Promise = require('promise')

var pipermail = require('../')

var index = pipermail.readIndex('https://mail.mozilla.org/pipermail/es-discuss/')
describe('pipermail.readIndex', function () {
  it('parses the index to return an array of month urls', function (done) {
    this.slow(4000)
    this.timeout(8000)
    index.nodeify(function (err, res) {
      if (err) return done(err)
      assert(Array.isArray(res))
      assert(res.length > 70)
      assert(res.every(function (url) { return typeof url === 'string' && /^https:\/\/mail.mozilla.org\/pipermail\/es-discuss\/\d\d\d\d\-[A-Z][a-z]+$/.test(url) }))
      done()
    })
  })
})

var month = pipermail.readMonth('https://mail.mozilla.org/pipermail/es-discuss/2011-December')
describe('pipermail.readMonth', function () {
  it('parses a month listing page to return an array of message urls', function (done) {
    this.slow(4000)
    this.timeout(8000)
    month.nodeify(function (err, res) {
      if (err) return done(err)
      assert(Array.isArray(res))
      assert(res.length > 10)
      assert(res.every(function (url) { return typeof url === 'string' && /^https:\/\/mail.mozilla.org\/pipermail\/es-discuss\/2011-December\/\d\d\d\d\d\d\.html$/.test(url) }))
      done()
    })
  })
})

var message = pipermail.readMessage('https://mail.mozilla.org/pipermail/es-discuss/2013-April/029615.html')
var message2 = pipermail.readMessage('https://mail.mozilla.org/pipermail/es-discuss/2008-October/007920.html')
describe('pipermail.readMessage', function () {
  it('parses a message to return an object representing the message', function (done) {
    this.slow(4000)
    this.timeout(8000)
    message.nodeify(function (err, res) {
      if (err) return done(err)
      assert(res.url === 'https://mail.mozilla.org/pipermail/es-discuss/2013-April/029615.html')
      assert(res.header.subject === 'how to submit a proposal for ECMAScript 7?')
      assert(res.header.from.name === 'David Bruant')
      assert(res.header.from.email === 'bruant.d@gmail.com')
      assert(res.header.reply === 'mailto:es-discuss%40mozilla.org?Subject=Re:%20Re%3A%20how%20to%20submit%20a%20proposal%20for%20ECMAScript%207%3F&In-Reply-To=%3C515EA719.5000702%40gmail.com%3E')
      assert(res.header.subject === 'how to submit a proposal for ECMAScript 7?')
      assert(res.header.date.toISOString() === '2013-04-05T10:27:37.000Z')

      assert.equal(JSON.stringify(res.body), JSON.stringify(fs.readFileSync(__dirname + '/fixture.txt', 'utf8').replace(/\r\n/g, '\n')))
      done()
    })
  })
  it('can handle messages with empty bodies', function (done) {
    this.slow(4000)
    this.timeout(8000)
    message2.nodeify(done)
  })
})

var fromStream = require('../lib/download-html-to-stream')
var indexPath
var monthPathA
var monthPathB
var messagePaths = []
var messages = [{}, {}, {}, {}]
fromStream.readIndex = function (path, callback) {
  indexPath = path
  return Promise.from([
    'https://mail.mozilla.org/pipermail/es-discuss/2011-June',
    'https://mail.mozilla.org/pipermail/es-discuss/2011-July'])
}
fromStream.readMonth = function (path) {
  if (monthPathA) monthPathB = path
  else monthPathA = path
  if (path === 'https://mail.mozilla.org/pipermail/es-discuss/2011-June') {
    return Promise.from([
      'https://mail.mozilla.org/pipermail/es-discuss/2011-June/012345.html',
      'https://mail.mozilla.org/pipermail/es-discuss/2011-June/012346.html'])
  } else {
    return Promise.from([
      'https://mail.mozilla.org/pipermail/es-discuss/2011-July/012347.html',
      'https://mail.mozilla.org/pipermail/es-discuss/2011-July/012348.html'])
  }
}
var n = 0
fromStream.readMessage = function (path) {
  messagePaths.push(path)
  return Promise.from(messages[n++])
}
var streamError
var stream = pipermail('https://mail.mozilla.org/pipermail/es-discuss/')
stream.on('error', function (e) { streamError = e})
describe('pipermail', function () {
  it('returns a parsed stream of all messages', function (done) {
    this.slow(4000)
    this.timeout(8000)
    var i = 0
    if (streamError) return done(streamError)
    stream
      .on('error', done)
      .on('data', function (message) {
        assert(messagePaths[i] === [
          'https://mail.mozilla.org/pipermail/es-discuss/2011-June/012345.html',
          'https://mail.mozilla.org/pipermail/es-discuss/2011-June/012346.html',
          'https://mail.mozilla.org/pipermail/es-discuss/2011-July/012347.html',
           'https://mail.mozilla.org/pipermail/es-discuss/2011-July/012348.html'][i])
        assert(message = messages[i++])
      })
      .on('end', function () {
        assert(indexPath === 'https://mail.mozilla.org/pipermail/es-discuss/')
        assert(monthPathA === 'https://mail.mozilla.org/pipermail/es-discuss/2011-June')
        assert(monthPathB === 'https://mail.mozilla.org/pipermail/es-discuss/2011-July')
        assert(messagePaths.length === 4)
        assert(i === 4)
        done()
      })
  })
})