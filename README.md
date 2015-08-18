# videojs-automation
[![Build Status](https://travis-ci.org/forbesjo/videojs-automation.svg?branch=master)](https://travis-ci.org/forbesjo/videojs-automation)

Automation for video.js projects.

_Powered by [BrowserStack](https://www.browserstack.com) and [Sauce Labs](https://saucelabs.com)_

## Getting Started

`npm install --save-dev videojs-automation`

If using Sauce Labs [Add the secured Sauce Labs username and key to .travis.yml](https://docs.saucelabs.com/ci-integrations/travis-ci/).
If using BrowserStack add the [secured BrowserStack username and key](http://docs.travis-ci.com/user/environment-variables/#Encrypted-Variables) to .travis.yml or to the [repository settings](http://docs.travis-ci.com/user/environment-variables/#Defining-Variables-in-Repository-Settings)
### Example Task
```
videojs_automation: {
  test: ['test/test.js']
}
```

### Example Test

```
var Player = require('videojs-automation');

describe('Player', function() {
  it('should play', function() {
    var player = new Player('http://www.videojs.com');
    player.bigPlayButton().click();
    expect(player.isPlaying()).toBe(true);
  });
});
```
