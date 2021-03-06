var
  q = require('q'),
  FirefoxProfile = require('firefox-profile'),
  firefoxProfile = new FirefoxProfile();

exports.config = {
  getMultiCapabilities: function() {
    var deferred = q.defer();
    firefoxProfile.setPreference('plugin.state.silverlight', 2);
    firefoxProfile.setPreference('media.mediasource.whitelist', false);
    firefoxProfile.updatePreferences();
    firefoxProfile.encoded(function(encodedProfile) {
      var multiCapabilities;

      if (process.env.CI) {
        multiCapabilities = [{
            browserName: 'internet explorer',
            platform: 'Windows 8.1',
            version: '11'
          }, {
            browserName: 'chrome',
            platform: 'Windows 8.1'
          }, {
          browserName: 'firefox',
          platform: 'Linux',
          firefox_profile: encodedProfile,
          loggingPrefs: {
            browser: 'SEVERE'
          }
        }].map(function(browser) {
          if (process.env.TRAVIS) {
            browser.name = process.env.TRAVIS_BUILD_NUMBER + process.env.TRAVIS_BRANCH;
          } else {
            browser.name = browser.browserName + '-' + (browser.version || 'latest') + '-' + browser.platform;
          }

          browser.build = process.env.BUILD;
          browser['tunnel-identifier'] = process.env.TUNNEL_ID;
          browser.recordVideo = false;
          browser.recordScreenshots = false;

          return browser;
        });
      } else {
        multiCapabilities = [{
          browserName: 'chrome',
        }, {
          browserName: 'firefox',
          firefox_profile: encodedProfile,
          loggingPrefs: {
            browser: 'SEVERE'
          }
        }];
      }

      deferred.resolve(multiCapabilities);
    });

    return deferred.promise;
  },

  onPrepare: function() {
    var jasmineReporters = require('jasmine-reporters');
    browser.ignoreSynchronization = true;
    if (process.env.TEAMCITY_VERSION) {
      jasmine.getEnv().addReporter(new jasmineReporters.TeamCityReporter());
    }

    return browser.getCapabilities().then(function(caps) {
      browser.name = caps.get('browserName') + '-' + (caps.get('version') || 'latest') + '-' + caps.get('platform');
      browser.browserName = caps.get('browserName');
      browser.platform = caps.get('platform');
    });
  },

  maxDuration: 180, // Max time(sec) for a test suite to run on a VM

  framework: 'jasmine2',

  jasmineNodeOpts: {
    showColors: true,
    defaultTimeoutInterval: 60000
  }, // Time(ms) it takes for a single 'it' test to complete

  allScriptsTimeout: 30000 // Time(ms) it takes for an async script to complete
};
