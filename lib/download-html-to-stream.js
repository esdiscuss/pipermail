'use strict'

var assert = require('assert')
var Transform = require('barrage').Transform
var Readable = require('barrage').Readable
var promise = require('promise')

exports = (module.exports = download)
exports.readIndex = require('./read-index')
exports.readMonth = require('./read-month')
exports.readMessage = require('./read-message')

function toStream(p) {
  var source;
  if (Array.isArray(p)) {
    source = p.slice().reverse()
  } else {
    source = p.then(function (p) {
      source = p.slice().reverse()
      return source
    })
  }
  var stream = new Readable({objectMode: true})
  stream._read = read
  function read() {
    if (Array.isArray(source)) {
      while (source.length && stream.push(source.pop()));
      if (source.length === 0) stream.push(null)
    } else {
      source.then(read, function (err) {
        stream.emit('error', err);
        stream.push(null);
      })
    }
  }
  return stream
}

function download(src, options) {
  options = options || {}
  var filterMonth = options.filterMonth || TRUE
  var filterMessage = options.filterMessage || TRUE

  var months = exports.readIndex(src).then(function (months) {
    if (options.months && options.months !== Infinity) {
      return months.slice(Math.max(months.length - options.months, 0))
    } else {
      return months
    }
  })

  return toStream(months)
    .filter(filterMonth)
    .flatMap(function (month) {
      return exports.readMonth(month)
    }, {parallel: options.parallelMonths || 2})
    .filter(filterMessage)
    .map(function (url) {
      return exports.readMessage(url.toString())
    }, {parallel: options.parallel || 10})

  return dest
}
function log(txt) {
  return function (res) {
    console.log(txt)
    return res
  }
}

function TRUE() {
  return true
}
