module.exports = function(grunt) {
  'use strict';

  var ip = require('../src/ip'),
    protractorMainPath = require.resolve('protractor'),
    path = require('path'),
    protractorBinPath = path.resolve(protractorMainPath, '../../bin/protractor'),
    webdriverManagerPath = path.resolve(protractorMainPath, '../../bin/webdriver-manager'),
    connect = require('connect'),
    serveStatic = require('serve-static'),
    BrowserStackTunnel = require('browserstacktunnel-wrapper'),

    protractor = function(specs, cb) {
      grunt.util.spawn({
        cmd: protractorBinPath,
        args: [
          path.resolve(__dirname, '../src/protractor.config.js'),
          '--specs', specs.join()
        ],
        opts: {
          stdio: 'inherit'
        }
      }, function(err, res, code) {
        if (err) {
          grunt.log.error(String(res));
          grunt.warn('Tests failed, protractor exited with code: ' + code, code);
        }

        cb();
      });
    };

  grunt.registerMultiTask('videojs_automation', function() {
    var done = this.async(),
      server = connect(),
      opts = this.options({
        user: process.env.BROWSERSTACK_USER || '',
        key: process.env.BROWSERSTACK_KEY || '',
        build: process.env.TRAVIS_BUILD_NUMBER || 'local-' + Date.now(),
        ci: process.env.TRAVIS || false,
        specs: []
      }),
      specs = Array.isArray(this.data) ? this.data : opts.specs,
      tunnel;

    process.env.BROWSERSTACK_USER = opts.user;
    process.env.BROWSERSTACK_KEY = opts.key;
    process.env.BUILD = opts.build;
    process.env.CI = opts.ci;

    server.use(serveStatic('.'));
    server.listen(7777);

    if (opts.ci) {
      tunnel = new BrowserStackTunnel({
        key: opts.key,
        force: true,
        hosts: [{
          name: 'localhost',
          port: 7777
        }]
      });

      tunnel.start(function() {
        protractor(specs, function() {
          tunnel.stop(done);
        });
      });
    } else {
      grunt.util.spawn({
        cmd: webdriverManagerPath,
        args: ['update'],
        opts: {
          stdio: 'inherit'
        }
      }, function() {
        protractor(specs, done);
      });
    }
  });
};
