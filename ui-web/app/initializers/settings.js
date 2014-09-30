import Ember from "ember";

var settings = Ember.Object.extend(SETTINGS);

export var initialize = function(container, app) {
  app.register('settings:main', settings, {singleton:true});
  app.inject('controller', 'settings', 'settings:main');
};

export default {
  name: 'settings',

  initialize: initialize
};
