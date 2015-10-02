module.exports = function(grunt) {
  'use strict';

  require('time-grunt')(grunt);

  grunt.initConfig({
    jshint: {
      files: {
        src: ['./**/*.js', '!./node_modules/**/*.js']
      }
    },

    videojs_automation: {
      saucelabs: ['test/sanity-test.js', 'test/test.js'],
      browserstack: {
        options: {
          specs: ['test/sanity-test.js', 'test/test.js'],
          browserstack: true
        }
      }
    }
  });

  grunt.loadTasks('tasks');
  grunt.loadNpmTasks('grunt-contrib-jshint');

  grunt.registerTask('test', function() {
    if (!process.env.TRAVIS || process.env.TRAVIS_PULL_REQUEST === 'false') {
      grunt.task.run([
        'jshint',
        // 'videojs_automation:saucelabs',
        'videojs_automation:browserstack'
      ]);
    } else {
      grunt.task.run('jshint');
    }
  });

  grunt.registerTask('default', 'test');
};
