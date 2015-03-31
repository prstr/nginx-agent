"use strict";

var express = require('express')
  , fs = require('fs-extra')
  , path = require('path')
  , mime = require('mime')
  , NginxConf = require('nginx-conf');

module.exports = exports = function(options) {
  options = options || {};

  var app = express()
    , root = options.root || process.cwd();

  app.use(require('body-parser').json());
  app.use(require('body-parser').text());

  // Basic tenants mgmt

  app.get('/tenants', function(req, res, next) {
    fs.readdir(path.join(root, 'tenants'), function(err, dirs) {
      res.json(dirs || []);
    });
  });

  app.get('/tenants/:id', function(req, res, next) {
    req.url = req.url.replace('\/$', '') + '/nginx.conf';
    next();
  });

  app.post('/tenants/:id', function(req, res, next) {
    if (!req.is('json'))
      return res.sendStatus(406);
    var file = path.join(root, 'tenants', req.params.id, 'nginx.conf');
    var conf = new NginxConf(req.body);
    fs.outputFile(file, conf.toString(), 'utf-8', function(err) {
      /* istanbul ignore if */
      if (err) return next(err);
      res.sendStatus(200);
    });
  });

  app.delete('/tenants/:id', function(req, res, next) {
    var file = path.join(root, 'tenants', req.params.id);
    fs.remove(file, function(err) {
      /* istanbul ignore if */
      if (err) return next(err);
      res.sendStatus(200);
    });
  });

  // Files mgmt API

  app.all('/tenants/:id/*', function(req, res, next) {
    res.locals.file = path.join(root, 'tenants', req.params.id, req.params[1]);
    next();
  });

  app.get('/tenants/:id/*', function(req, res, next) {
    fs.readFile(res.locals.file, 'utf-8', function(err, text) {
      /* istanbul ignore if */
      if (err) return res.sendStatus(404);
      res.type(mime.lookup(file));
      res.end(text);
    });
  });

  app.post('/tenants/:id/*', function(req, res, next) {
    fs.outputFile(res.locals.file, req.body, 'utf-8', function(err) {
      /* istanbul ignore if */
      if (err) return next(err);
      res.sendStatus(200);
    });
  });

  app.delete('/tenants/:id/*', function(req, res, next) {
    fs.remove(res.locals.file, function(err) {
      /* istanbul ignore if */
      if (err) return next(err);
      res.sendStatus(200);
    });
  });

};
