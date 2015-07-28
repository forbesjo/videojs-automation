module.exports = function(grunt) {
  'use strict';

  grunt.initConfig({
    jshint: {
      files: {
        src: ['./**/*.js', '!./node_modules/**/*.js']
      }
    },

    videojs_automation: {
      test: ['test/sanity-test.js', 'test/test.js'],
      browserstack: {
        options: {
          browserstack: true,
          specs: ['test/sanity-test.js', 'test/test.js'],
          user: process.env.BROWSERSTACK_USER,
          key: process.env.BROWSERSTACK_KEY
        }
      }
    }
  });

  grunt.loadTasks('tasks');
  grunt.loadNpmTasks('grunt-contrib-jshint');

  grunt.registerTask('test', function() {
    if (!process.env.TRAVIS || process.env.TRAVIS_PULL_REQUEST === 'false') {
      grunt.task.run(['jshint', 'videojs_automation']);
    } else {
      grunt.task.run('jshint');
    }
  });

  grunt.registerTask('default', 'test');
};
