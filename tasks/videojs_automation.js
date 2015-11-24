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
  grunt.loadTasks(resolveTasks('grunt-localstack'));

  grunt.registerMultiTask('videojs_automation', function() {
    var
      done = this.async(),
      opts = this.options({
        user: process.env.BROWSERSTACK_USER || '',
        key: process.env.BROWSERSTACK_KEY || '',
        build: process.env.TRAVIS_BUILD_NUMBER || 'local-' + Date.now(),
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
        process.env.BROWSERSTACK_USER = opts.browserstackUser;
        process.env.BROWSERSTACK_KEY = opts.browserstackKey;
        protractorOptions.options.args.seleniumAddress = 'http://hub.browserstack.com/wd/hub';
        protractorOptions.options.args.maxSessions = 1;
      }

      grunt.config.set('protractor.videojs_automation', protractorOptions);
      grunt.config.set('localstack', {
        options: {
          key: opts.browserstackKey,
          force: true,
          hosts: [{
            name: 'localhost',
            port: port
          }]
        }
      });

      if (process.env.CI) {
        // wait until a VM is open
        var BS = require('browserstack');
        var bs = new BS.createClient({
          username: opts.user,
          password: opts.key
        });

        bs.getApiStatus(function(err, status) {
          console.log('Browserstack VMs available: ' + (status.running_sessions !== status.sessions_limit));

          grunt.task.run([
            'localstack',
            'connect:videojs_automation',
            'protractor:videojs_automation',
            'localstack:stop'
          ]);

          done();
        });
      } else {
        grunt.task.run([
          'connect:videojs_automation',
          'protractor:videojs_automation'
        ]);

        done();
      }
    });
  });
};
