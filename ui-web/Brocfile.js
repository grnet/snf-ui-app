var EmberApp = require('ember-cli/lib/broccoli/ember-app');
var pickFiles = require('broccoli-static-compiler');
var mergeTrees = require('broccoli-merge-trees');
var app = new EmberApp();

app.import('bower_components/moment/moment.js');
app.import('bower_components/foundation/js/foundation/foundation.js');
app.import('bower_components/foundation/js/foundation/foundation.reveal.js');
app.import('bower_components/underscore/underscore.js');
app.import('bower_components/is_js/is.js');

var workers = pickFiles(mergeTrees(['bower_components/asmcrypto', 'workers']), {
  srcDir: '/',
  files: ['asmcrypto.js', 'worker_*.js'],
  destDir: '/assets/workers'
});

module.exports = app.toTree(workers);
