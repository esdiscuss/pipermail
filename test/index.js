var assert = require('assert')
var fs = require('fs')

var Q = require('q')

var pipermail = require('../')

var index = Q.denodeify(pipermail.readIndex)('https://mail.mozilla.org/pipermail/es-discuss/')
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

var month = Q.denodeify(pipermail.readMonth)('https://mail.mozilla.org/pipermail/es-discuss/2011-December')
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

var message = Q.denodeify(pipermail.readMessage)('https://mail.mozilla.org/pipermail/es-discuss/2013-April/029615.html')
describe('pipermail.readMessage', function () {
  it('parses a message to return an object representing teh message', function (done) {
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
})