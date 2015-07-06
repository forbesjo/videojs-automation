module.exports = function(grunt) {
  'use strict';

  var ip = require('../src/ip'),
    protractorMainPath = require.resolve('protractor'),
    path = require('path'),
    protractorBinPath = path.resolve(protractorMainPath, '../../bin/protractor'),
    webdriverManagerPath = path.resolve(protractorMainPath, '../../bin/webdriver-manager'),
    connect = require('connect'),
    serveStatic = require('serve-static'),
    SauceTunnel = require('sauce-tunnel'),
    spawn = require('child_process').spawn,

    protractor = function(specs, cb) {
      spawn(protractorBinPath, [
        path.resolve(__dirname, '../src/protractor.config.js'),
        '--specs', specs.join()
      ], {
        stdio: 'inherit'
      }).once('close', cb);
    };

  grunt.registerMultiTask('videojs_automation', function() {
    var done = this.async(),
      server = connect(),
      opts = this.options({
        tunneled: false,
        specs: []
      }),
      specs = Array.isArray(this.data) ? this.data : opts.specs,
      tunnel;

    server.use(serveStatic('.'));
    server.listen(7777);

    if (process.env.TRAVIS || process.env.TEAMCITY_VERSION) {
      if (opts.tunneled) {
        tunnel = new SauceTunnel(
          process.env.SAUCE_USERNAME,
          process.env.SAUCE_ACCESS_KEY,
          process.env.BUILD_NUMBER || process.env.TRAVIS_JOB_NUMBER,
          true, ['--tunnel-domains', ip]
        );

        tunnel.start(function() {
          protractor(specs, function() {
            tunnel.stop(done);
          });
        });

      } else {
        protractor(specs, done);
      }

    } else {
      spawn(webdriverManagerPath, ['update'], {
        stdio: 'inherit'
      }).once('close', function() {
        protractor(specs, done);
      });
    }
  });
};
