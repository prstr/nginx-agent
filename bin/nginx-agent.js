#!/usr/bin/env node
"use strict";

var path = require('path')
  , extend = require('extend')
  , fs = require('fs-extra')
  , http = require('http')
  , NginxConf = require('nginx-json');

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

// Bootstrap current dir with default `nginx.conf`

var rootConf = new NginxConf({ 'include': 'tenants/*/nginx.conf' })
  , rootConfFile = path.join(process.cwd(), 'nginx.conf');

fs.writeFile(rootConfFile, rootConf.toString(), 'utf-8', function(err) {
  if (err)
    console.error('Could not write to %s', rootConfFile);
  else
    console.log('Written root conf to %s', rootConfFile);
});
