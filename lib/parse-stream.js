var transform = require('transform-stream');

//From brendan at mozilla.com  Tue Oct 24 13:41:36 2006
var pattern = /^From [^ ]+ at [^ ]+  ?[A-Z][a-z][a-z][a-z]? [A-Z][a-z][a-z][a-z]?  ?\d\d? \d\d:\d\d:\d\d \d\d\d\d$/m;

module.exports = createParseStream;
function createParseStream() {
  var buffer = '';
  return transform(function (item, next, finish) {
    item = item.toString().replace(/\r/g, '');
    buffer += item;
    if (pattern.test(buffer)) {
      var buf = buffer.split(pattern);
      for (var i = 0; i < (buf.length - 1); i++) {
        var output = buf[i].trim()
        if (output.length) next(parseMessage(output));
      }
      buffer = buf[buf.length - 1];
      finish();
    } else {
      finish();
    }
  }, function (finish) {
    var output = buffer.trim();
    if (output.length) finish(null, parseMessage(output));
    else finish();
    buffer = null;
  });
}

function parseMessage(message) {
  var split = message.indexOf('\n\n');
  if (split < 0) return undefined;
  var head = message.substr(0, split);
  var body = message.substr(split + 2).trim().replace(/\r/g, '');

  var header = {};
  var match, pattern = /^([a-z\-]+): (.*)$/gim;
  while (match = pattern.exec(head)) {
    header[cammelCase(match[1])] = fixup(match[2]);
  }

  var from = /^(.*) \((.*)\)$/m.exec(header.from);
  if (from) {
    header.from = {
      email: from[1].replace(' at ', '@'),
      name: from[2].replace(/\=.*\=/g, '')
    };
  }

  return {header: header, body: body};
}

function cammelCase(key) {
  return key.replace(/^[A-Z]/g, function (c) { return c.toLowerCase(); })
            .replace(/\-/g, '');
}
function fixup(value) {
  return value
    .replace(/=\?([^\?]+)\?B\?(.*)\?=/g, function (_, encoding, text) {
      text = new Buffer(text, 'base64').toString('ascii')
      return '=?' + encoding + '?Q?' + text + '?=';
    })
    .replace(/=\?([^\?]+)\?Q\?(.*)\?=/g, function (_, encoding, text) {
      return text.replace(/_/g, ' ').replace(/=([0-9A-F][0-9A-F])/g, function (_, val) {
        return String.fromCharCode(parseInt(val, 16))
      });
    });
}