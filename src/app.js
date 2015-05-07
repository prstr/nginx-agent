'use strict';

var express = require('express')
  , fs = require('fs-extra')
  , path = require('path')
  , nginx = require('./nginx')
  , NginxConf = require('nginx-json');

module.exports = exports = function (options) {
  options = options || {};

  var app = express()
    , root = options.root || process.cwd();

  app.use(require('body-parser').json());
  app.use(require('body-parser').text());

  if (process.env.NODE_ENV != 'production')
    app.use(require('morgan')('dev'));

  // Basic auth

  if (options.password)
    app.use(function (req, res, next) {
      var credentials = require('basic-auth')(req);
      if (!credentials || credentials.pass != options.password) {
        res.status(401);
        res.set('WWW-Authenticate', 'Basic');
        return res.end();
      }
      next();
    });

  // Basic tenants mgmt

  app.get('/', function (req, res) {
    fs.readdir(root, function (ignoredErr, confs) {
      if (!confs)
        return res.json([]);
      res.json(confs.filter(function (file) {
        return file.indexOf(file.length - 5 == '.conf');
      }));
    });
  });

  app.get('/:id', function (req, res) {
    var file = path.join(root, req.params.id + '.conf');
    fs.readFile(file, 'utf-8', function (err, text) {
      if (err) return res.sendStatus(404);
      res.type('text');
      res.end(text);
    });
  });

  app.post('/:id', function (req, res, next) {
    nginx.update(root, function (cb) {
      var file = path.join(root, req.params.id + '.conf');
      var conf = req.is('json') ?
        new NginxConf(req.body).toString() :
        req.body;
      fs.outputFile(file, conf, 'utf-8', cb);
    }, function (err) {
      if (err) return next(err);
      res.sendStatus(200);
    });
  });

  app.delete('/:id', function (req, res, next) {
    nginx.update(root, function (cb) {
      var file = path.join(root, req.params.id + '.conf');
      fs.remove(file, cb);
    }, function (err) {
      if (err) return next(err);
      res.sendStatus(200);
    });
  });

  /* eslint-disable no-unused-vars */
  app.use(function (err, req, res, next) {
    /* eslint-enable no-unused-vars */
    res.status(500);
    res.type('text/plain');
    res.end(err.message);
  });

  return app;

};
