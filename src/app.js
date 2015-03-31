"use strict";

var express = require('express')
  , fs = require('fs-extra')
  , path = require('path')
  , mime = require('mime')
  , spawn = require('child_process').spawn
  , NginxConf = require('nginx-json');

module.exports = exports = function(options) {
  options = options || {};

  var app = express()
    , root = options.root || process.cwd();

  app.use(require('body-parser').json());

  // Basic auth

  if (options.password)
    app.use(function(req, res, next) {
      var credentials = require('basic-auth')(req);
      if (!credentials || credentials.pass != options.password) {
        res.set('WWW-Authenticate', 'Basic');
        return res.end();
      }
      next();
    });

  // Basic tenants mgmt

  app.get('/tenants', function(req, res, next) {
    fs.readdir(path.join(root, 'tenants'), function(err, dirs) {
      res.json(dirs || []);
    });
  });

  app.get('/tenants/:id', function(req, res, next) {
    var file = path.join(root, 'tenants', req.params.id + '.conf');
    fs.readFile(file, 'utf-8', function(err, text) {
      /* istanbul ignore if */
      if (err) return res.sendStatus(404);
      res.type('text');
      res.end(text);
    })
  });

  app.post('/tenants/:id', function(req, res, next) {
    if (!req.is('json'))
      return res.sendStatus(406);
    var file = path.join(root, 'tenants', req.params.id + '.conf');
    var conf = new NginxConf(req.body);
    fs.outputFile(file, conf.toString(), 'utf-8', function(err) {
      /* istanbul ignore if */
      if (err) return next(err);
      res.sendStatus(200);
    });
  });

  app.delete('/tenants/:id', function(req, res, next) {
    var file = path.join(root, 'tenants', req.params.id + '.conf');
    fs.remove(file, function(err) {
      /* istanbul ignore if */
      if (err) return next(err);
      res.sendStatus(200);
    });
  });

  // Nginx reload

  app.post('/reload', function(req, res, next) {
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
        res.status(500);
      res.type('text');
      res.end(buf);
    });
  });

  return app;

};
