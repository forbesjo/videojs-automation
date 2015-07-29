var
  protractorMainPath = require.resolve('protractor'),
  path = require('path'),
  connect = require('connect'),
  serveStatic = require('serve-static'),
  portscanner = require('portscanner'),
  SauceTunnel = require('sauce-tunnel'),
  BrowserStackTunnel = require('browserstacktunnel-wrapper'),
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
        '--baseUrl', 'http://' + ip + ':' + opts.port,
        '--specs', opts.specs.join(),
      ];

    if (opts.ci) {
      process.env.CI = opts.ci;
      process.env.BUILD = opts.build;

      if (opts.browserstack) {
        process.env.BROWSERSTACK = true;
        process.env.BROWSERSTACK_USER = opts.browserstackUser;
        process.env.BROWSERSTACK_KEY = opts.browserstackKey;
        args.push('--seleniumAddress', 'http://hub.browserstack.com/wd/hub');
        args.push('--maxSessions', '2');
      } else {
        args.push('--sauceUser', opts.user, '--sauceKey', opts.key);
        process.env.TUNNEL_ID = opts.tunnelid;
        args.push('--maxSessions', '6');
      }
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

  videojs_automation = function(opts, cb) {
    var tunnel;

    portscanner.findAPortNotInUse(8000, 9000, ip, function(err, port) {
      var server = connect();
      opts.port = port;
      server.use(serveStatic('.'));
      server.listen(opts.port);
    });

    if (opts.ci) {
      if (opts.tunneled) {
        if (opts.browserstack) {
          tunnel = new BrowserStackTunnel({
            key: opts.browserstackKey,
            force: true,
            hosts: [{
              name: ip,
              port: opts.port
            }]
          });
        } else {
          tunnel = new SauceTunnel(
            opts.user, opts.key,
            opts.tunnelid,
            opts.tunneled, ['--tunnel-domains', ip]
          );
        }

        tunnel.start(function() {
          protractor(opts, function(code) {
            tunnel.stop(function() {
              cb(code);
            });
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
