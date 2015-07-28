var
  protractorMainPath = require.resolve('protractor'),
  path = require('path'),
  connect = require('connect'),
  serveStatic = require('serve-static'),
  SauceTunnel = require('sauce-tunnel'),
  spawn = require('child_process').spawn,

  netInterfaces = require('os').networkInterfaces(),
  externalIps = Object.keys(netInterfaces)
  .reduce(function(result, iface) {
    return result.concat(netInterfaces[iface]);
  }, [])
  .filter(function(iface) {
    return iface.family === 'IPv4' && !iface.internal;
  }),
  ip = externalIps[externalIps.length - 1].address,

  protractor = function(opts, cb) {
    var
      protractorBinPath = path.resolve(protractorMainPath, '../../bin/protractor'),
      args = [
        path.resolve(__dirname, '../src/protractor.config.js'),
        '--baseUrl', 'http://' + ip + ':7777',
        '--specs', opts.specs.join(),
      ];

    if (opts.ci && opts.user && opts.key) {
      args.push('--sauceUser', opts.user, '--sauceKey', opts.key);
    }

    spawn(protractorBinPath, args, {
      stdio: 'inherit'
    }).on('exit', cb);
  },

  updateWebdriver = function(cb) {
    var webdriverManagerPath = path.resolve(protractorMainPath, '../../bin/webdriver-manager');
    spawn(webdriverManagerPath, ['update'], {
      stdio: 'inherit'
    }).on('exit', cb);
  },

  startServer = function() {
    var server = connect();
    server.use(serveStatic('.'));
    server.listen(7777);
  },

  videojs_automation = function(opts, cb) {
    var tunnel;
    startServer();

    if (opts.ci) {
      process.env.CI = opts.ci;
      process.env.BUILD = opts.build;
      if (opts.tunneled) {
        process.env.TUNNEL_ID = opts.tunnelid;
        tunnel = new SauceTunnel(
          opts.user, opts.key,
          opts.tunnelid,
          opts.tunneled, ['--tunnel-domains', ip]
        );

        tunnel.start(function() {
          protractor(opts, function() {
            tunnel.stop(cb);
          });
        });
      } else {
        protractor(opts, cb);
      }

    } else {
      updateWebdriver(function() {
        protractor(opts, cb);
      });
    }
  };

module.exports = videojs_automation;
