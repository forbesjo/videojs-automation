# videojs-automation
[![Build Status](https://travis-ci.org/forbesjo/videojs-automation.svg?branch=master)](https://travis-ci.org/forbesjo/videojs-automation)

[![Sauce Test Status](https://saucelabs.com/browser-matrix/forbesjo-vjs.svg)](https://saucelabs.com/u/forbesjo-vjs)

Automation for video.js projects.

## Getting Started

`npm install --save-dev videojs-automation`

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
