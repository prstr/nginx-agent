"use strict";

var os = require('os')
  , path = require('path')
  , spawn = require('child_process').spawn
  , async = require('async')
  , glob = require('glob')
  , fs = require('fs-extra');

exports.reload = function(cb) {
  var p = spawn('nginx', ['-s', 'reload'])
    , buf = '';
  p.stdout.on('data', function(data) {
    buf += data + '\n';
  });
  p.stderr.on('data', function(data) {
    buf += data + '\n';
  });
  p.on('close', function(code) {
    if (code > 0)
      return cb(new Error('Nginx reload failed: ' + buf));
    else
      return cb(null, buf);
  });
};

exports.update = function(root, actions, cb) {
  var tmpDir = path.join(os.tmpDir(), Math.random().toString(36));
  var queries = [];
  queries.push(function(cb) {
    copyConfs(root, tmpDir, cb);
  });
  queries.push(function(cb) {
    actions(cb);
  });
  queries.push(exports.reload);
  async.series(queries, function(err) {
    queries = [];
    if (err) {
      queries.push(function(cb) {
        rmConfs(root, cb);
      });
      queries.push(function(cb) {
        copyConfs(tmpDir, root, cb);
      });
    }
    queries.push(function(cb) {
      fs.remove(tmpDir, cb)
    });
    async.series(queries, cb.bind(null, err));
  });
};

function copyConfs(src, dst, cb) {
  glob('**/*.conf', {
    cwd: src,
    nodir: true
  }, function(err, files) {
    if (err) return cb(err);
    async.each(files, function(file, cb) {
      var srcFile = path.join(src, file);
      var dstFile = path.join(dst, file);
      fs.mkdirp(path.dirname(dstFile), function(err) {
        if (err) return cb(err);
        fs.copy(srcFile, dstFile, cb);
      });
    }, cb);
  });
}

function rmConfs(dir, cb) {
  glob('**/*.conf', {
    cwd: dir,
    nodir: true
  }, function(err, files) {
    if (err) return cb(err);
    async.each(files, function(file, cb) {
      fs.remove(path.join(dir, file), cb);
    }, cb);
  });
}

