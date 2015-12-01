var
  q = require('q'),
  now = Date.now(),
  browsers = require('detect-browsers').getInstalledBrowsers(),
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
          //   browserName: 'edge',
          //   os: 'Windows',
          //   os_version: '10',
          //   browser_version: '12',
          // }, {
          browserName: 'internet explorer',
          os: 'Windows',
          os_version: '8.1',
          browser_version: '11',
        }, {
          browserName: 'internet explorer',
          os: 'Windows',
          os_version: '7',
          browser_version: '11',
          // }, {
          //   browserName: 'internet explorer',
          //   os: 'Windows',
          //   os_version: '7',
          //   browser_version: '10',
          // }, {
          //   browserName: 'internet explorer',
          //   os: 'Windows',
          //   os_version: '7',
          //   browser_version: '9',
          // }, {
          //   browserName: 'internet explorer',
          //   os: 'Windows',
          //   os_version: '7',
          //   browser_version: '8',
        }, {
          browserName: 'safari',
          os: 'OS X',
          os_version: 'El Capitan',
          browser_version: '9'
        }, {
          browserName: 'firefox',
          os: 'Windows',
          firefox_profile: encodedProfile
        }, {
          browserName: 'chrome',
          os: 'Windows',
        }].map(function(browser) {
          if (process.env.TRAVIS) {
            browser.name = process.env.TRAVIS_BUILD_NUMBER + process.env.TRAVIS_BRANCH;
          } else {
            browser.name = browser.browserName + '-' + (browser.browser_version || 'latest') + '-' + browser.os + (!browser.os_version ? '' : '-' + browser.os_version);
          }

          browser.build = process.env.BUILD || 'local-' + now;
          browser['browserstack.user'] = process.env.BROWSERSTACK_USER;
          browser['browserstack.key'] = process.env.BROWSERSTACK_KEY;
          browser['browserstack.local'] = 'true';
          browser['browserstack.video'] = 'false';

          return browser;
        });
      } else {
        multiCapabilities = browsers
          .filter(function(browser) {
            return /chrome|firefox|safari/i.test(browser.name);
          })
          .map(function(browser) {
            var obj = {
              browserName: browser.name.toLowerCase()
            };

            if (/firefox/i.test(browser.name)) {
              obj.firefox_profile = encodedProfile;
            }

            return obj;
          });
      }

      deferred.resolve(multiCapabilities);
    });

    return deferred.promise;
  },

  maxSessions: process.env.CI ? process.env.MAX_SESSIONS : -1,

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
