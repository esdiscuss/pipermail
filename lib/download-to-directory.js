var request = require('request');
var fs = require('fs');
var path = require('path');
var zlib = require('zlib');

module.exports = download;

function download(index, to, gunzip, callback) {
  if (arguments.length === 3 && typeof gunzip === 'function') {
    callback = gunzip;
    gunzip = false;
  }
  var toDo = index.length;
  if (index.length === 0) return callback();
  index.forEach(function (file) {
    var src = request(file);
    src.on('error', onError);
    if (gunzip) {
      src = src.pipe(zlib.createGunzip());
      src.on('error', onError);
    }
    var destPath = path.join(to, file.replace(/^.*\/([^\/]+)$/, '$1'));
    if (gunzip) {
      destPath = destPath.replace(/\.gz$/, '')
    }
    var dest = fs.createWriteStream(destPath);
    src.pipe(dest);
    dest.on('error', onError);
    dest.on('close', function () {
      if (0 === --toDo) {
        callback();
      }
    });
  });

  function onError(err) {
    toDo = -1;
    callback(err);
  }
}