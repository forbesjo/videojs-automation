module.exports = function(grunt) {
  'use strict';
  var videojs_automation = require('../src/videojs_automation');

  grunt.registerMultiTask('videojs_automation', function() {
    var
      done = this.async(),
      opts = this.options({
        user: process.env.SAUCE_USERNAME || '',
        key: process.env.SAUCE_ACCESS_KEY || '',
        build: process.env.TRAVIS_BUILD_NUMBER || 'local-' + Date.now(),
        tunneled: process.env.TRAVIS ? true : false,
        tunnelid: process.env.TRAVIS_JOB_NUMBER || 'local',
        ci: process.env.TRAVIS || false,
        specs: Array.isArray(this.data) ? this.data : []
      });

    videojs_automation(opts, function(code) {
      if (code > 0) {
        grunt.warn('Tests failed, protractor exited with code: ' + code, code);
      }

      done();
    });
  });
};
