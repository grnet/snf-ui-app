/* global require, module */
var EmberApp = require('ember-cli/lib/broccoli/ember-app');
var pickFiles = require('broccoli-static-compiler');
var mergeTrees = require('broccoli-merge-trees');
var app = new EmberApp({
  outputPaths: {
    app: {
      css: {
        'app': 'assets/ui-web.css',
        'themes/theme-funky': 'assets/theme-funky.css',
        'themes/theme-okeanos': 'assets/theme-okeanos.css',
      }
    }
  },

  hinting: false
});
app.project.addons.push(require('./ember-cli-synnefo'));

app.import('bower_components/moment/moment.js');
app.import('bower_components/foundation/js/foundation/foundation.js');
app.import('bower_components/foundation/js/foundation/foundation.reveal.js');
app.import('bower_components/foundation/js/foundation/foundation.tooltip.js');
app.import('bower_components/foundation/js/vendor/modernizr.js');
app.import('bower_components/underscore/underscore.js');
app.import('bower_components/is_js/is.js');
app.import('bower_components/jquery-cookie/jquery.cookie.js');
app.import('bower_components/jquery.iframe-transport/jquery.iframe-transport.js');
app.import('bower_components/chartist/dist/chartist.min.js');
app.import('bower_components/chartist/dist/chartist.min.css');
app.import('bower_components/async/lib/async.js');

var workers = pickFiles(mergeTrees(['bower_components/asmcrypto', 'workers']), {
  srcDir: '/',
  files: ['asmcrypto.js', 'worker_*.js'],
  destDir: '/assets/workers'
});

module.exports = app.toTree(workers);
