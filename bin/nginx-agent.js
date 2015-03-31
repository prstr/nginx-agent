#!/usr/bin/env node
"use strict";

var path = require('path')
  , extend = require('extend')
  , fs = require('fs-extra')
  , http = require('http');

var options = {
  port: 7390,
  ip: '127.0.0.1',
  password: ''
};

var userOptionsFile = path.join(process.cwd(), 'nginx-agent.json');

extend(options, fs.readJsonFileSync(userOptionsFile, 'utf-8'));

var app = require('../src/app')(options);

http.createServer(app).listen(options.port, options.ip, function() {
  console.log('Listening on %s:%s', options.ip, options.port);
});
