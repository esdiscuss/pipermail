var request = require('request');
var fs = require('fs');
var path = require('path');
var zlib = require('zlib');
var through = require('through');
var ProgressBar = require('progress');

var parseIndex = require('./parse-index');

try {
  fs.mkdirSync(path.join(__dirname, '..', 'cache'));
} catch (ex) {}

module.exports = download;
function download(src, options) {
  options = options || {};
  var progress = options.progress || false;
  var cache = options.cache || false;
  var gzip = options.gzip !== false;

  var dest = through();

  var cacheDir = options.cacheDir ||
    path.join(__dirname, '..', 'cache', src.toLowerCase().replace(/[^a-z0-9]+/g, '-'));

  if (cache) {
    try {
      fs.mkdirSync(cacheDir);
    } catch (ex) {}
  }

  parseIndex(src, function (err, index) {
    next(0);

    var bar;
    if (progress) {
      console.log();
      console.log();
      bar = new ProgressBar('  downloading [:bar] :percent :etas', {
        complete: '=',
        incomplete: ' ',
        width: 20,
        total: index.length
      })
    }

    function next(i) {
      if (i === index.length) {
        if (progress) {
          bar.rl.close();
          console.log();
          console.log();
        }
        return dest.end();
      }
      var src = read(i);
      src.on('error', dest.emit.bind(dest, 'error'));
      src = src.pipe(zlib.createGunzip());
      src.on('end', function () {
        if (progress) bar.tick(1);
        next(i + 1);
      });
      src.pipe(dest, {end: false});
    }

    function read(i) {
      if (cache) {
        try {
          fs.statSync(cachePath(i));
          fs.statSync(cachePath(i + 1));
          return fs.createReadStream(cachePath(i));
        } catch (ex) {}
      }
      var src = gzip ? request(index[i]) : request(index[i].replace(/\.gz$/g, '')).pipe(zlib.createGzip());
      if (cache)
        src.pipe(fs.createWriteStream(cachePath(i)));
      return src;
    }
    function cachePath(i) {
      return path.join(cacheDir, index[i].replace(/^.*\/([^\/]+)$/, '$1'));
    }
  });

  return dest;
}

