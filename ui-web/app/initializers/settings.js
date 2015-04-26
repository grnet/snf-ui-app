import Ember from "ember";
import Settings from "../snf/settings";

var settings = Settings.create(SETTINGS);

var registerAndAdvance = function(settings, container, app, err) {
  app.register('settings:main', settings, {singleton:true, instantiate: false});
  app.inject('controller', 'settings', 'settings:main');
  app.inject('adapter', 'settings', 'settings:main');
  app.inject('model', 'settings', 'settings:main');
  app.inject('route', 'settings', 'settings:main');
  app.advanceReadiness();
  
  // cache settings to cookie
  settings.persist('ui_settings');
}

var resolveAuth = function(settings, container, app) {
  var token = settings.get('token'), loginUrl = settings.get('loginUrl');
  if (!token) {
    if (settings.localToken) {
      token = window.prompt("Gimme your token");
      settings.set('token', token);
    } else {
      if (!loginUrl) { throw "Invalid login url"; }
      window.location = loginUrl;
    }
  }
  return settings.resolveUser();
}


export var initialize = function(container, app) {
  app.deferReadiness();
 
  settings.loadFromCookie("ui_settings");
  settings.loadFromQS(window.location.hash.replace(/^#/, '') || '');

  var authUrl = settings.get("authUrl");
  if (authUrl) {

    var _bind = function(fn) {return fn.bind(this, settings, container, app);}

    settings.extendFromUrl(authUrl, {method: 'post'})
      .then(_bind(resolveAuth), _bind(resolveAuth))
      .then(_bind(registerAndAdvance)).catch(function(err) {
        console.error(err);
        app.advanceReadiness();
      });; 
  }
};

export default {
  name: 'settings',
  initialize: initialize
};
