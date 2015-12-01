var Player = require('../src/player');

[{
  suite: 'videojs',
  isBrowserSupported: function() {
    return /firefox|safari|chrome|internet explorer/i.test(browser.browserName);
  }
}, {
  suite: 'videojs-contrib-dash',
  isBrowserSupported: function() {
    return /chrome/i.test(browser.browserName);
  }
}].map(function(p) {
  if (p.isBrowserSupported()) {
    return describe(p.suite + ' Player', function() {
      var playerUrl = browser.baseUrl + '/test/' + p.suite + '.html',
        player;

      beforeEach(function() {
        player = new Player(playerUrl);
      });

      it('should have no console errors', function() {
        // cannot get logs with iedriver
        if (!/explorer/i.test(browser.browserName)) {
          player.bigPlayButton().click();
          player.consoleLog().then(function(logs) {
            expect(logs.length).toBe(0);
          });
        }
      });

      xit('should have no player errors', function() {
        expect(player.error()).toBeNull();
      });

      it('should play', function() {
        player.bigPlayButton().click();
        expect(player.isPlaying()).toBe(true);
      });

      xit('should set current time', function() {
        player.bigPlayButton().click();
        player.playControl().click();
        expect(player.currentTime(3)).toBeCloseTo(3, 0);
      });

      xit('should seek (forwards and backwards)', function() {
        player.bigPlayButton().click();
        player.playControl().click();
        expect(player.currentTime(4)).toBeCloseTo(4, 0);
        expect(player.currentTime(2)).toBeCloseTo(2, 0);
      });

      xit('should progress', function() {
        player.bigPlayButton().click();
        var time1 = player.currentTime();
        browser.executeAsyncScript(function(done) {
          player.on('timeupdate', function() {
            if (player.currentTime() >= 1) done();
          });
        });
        var time2 = player.currentTime();
        expect(time1).toBeLessThan(time2);
      });

      xit('should pause and resume', function() {
        player.bigPlayButton().click();
        expect(player.isPlaying()).toBe(true);
        player.playControl().click();
        expect(player.paused()).toBe(true);

        // reset to beginning, the video may have finished
        // at the last isPlaying()
        player.currentTime(0);

        player.playControl().click();
        expect(player.isPlaying()).toBe(true);
      });
    });
  }
});
