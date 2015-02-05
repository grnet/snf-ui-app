var EmberApp = require('ember-cli/lib/broccoli/ember-app');
var app = new EmberApp();

app.import('bower_components/ember-droplet/dist/ember-droplet.js');
app.import('bower_components/moment/moment.js');
app.import('bower_components/foundation/js/foundation/foundation.js');
app.import('bower_components/foundation/js/foundation/foundation.reveal.js');
app.import('bower_components/underscore/underscore.js');
app.import('bower_components/is_js/is.js');

module.exports = app.toTree();
