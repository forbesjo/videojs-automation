module.exports = function(grunt) {
  'use strict';
  var
    path = require('path'),
    portscanner = require('portscanner'),
    resolve = require('resolve'),
    resolveTasks = function(module) {
      return path.join(path.dirname(resolve.sync(module, {
        packageFilter: function(pkg) {
          pkg.main = 'package.json';
          return pkg;
        }
      })), 'tasks');
    };

  grunt.loadTasks(resolveTasks('grunt-contrib-connect'));
  grunt.loadTasks(resolveTasks('grunt-protractor-runner'));

  grunt.registerMultiTask('videojs_automation', function() {
    var
      done = this.async(),
      opts = this.options({
        user: process.env.SAUCE_USERNAME || '',
        key: process.env.SAUCE_ACCESS_KEY || '',
        build: process.env.TRAVIS_BUILD_NUMBER || 'local-' + Date.now(),
        tunnelid: process.env.TRAVIS_JOB_NUMBER || 'local',
        specs: Array.isArray(this.data) ? this.data : []
      }),
      protractorOptions;

    portscanner.findAPortNotInUse(8000, 9000, 'localhost', function(err, port) {
      grunt.config.set('connect.videojs_automation', {
        options: {
          port: port
        }
      });

      protractorOptions = {
        configFile: path.resolve(__dirname, '../src/protractor.config.js'),
        options: {
          args: {
            specs: opts.specs,
            baseUrl: 'http://localhost:' + port
          },
          webdriverManagerUpdate: !(process.env.CI && true)
        }
      };

      if (process.env.CI) {
        process.env.BUILD = opts.build;
        process.env.TUNNEL_ID = opts.tunnelid;

        protractorOptions.options.args.sauceUser = opts.user;
        protractorOptions.options.args.sauceKey = opts.key;
        protractorOptions.options.args.maxSessions = 6;
      }

      grunt.config.set('protractor.videojs_automation', protractorOptions);

      grunt.task.run([
        'connect:videojs_automation',
        'protractor:videojs_automation'
      ]);

      done();
    });
  });
};
