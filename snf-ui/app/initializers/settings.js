import Ember from "ember";
import Settings from "../snf/settings";

var settings = Settings.create(SETTINGS);

var registerAndAdvance = function(settings, container, app, err) {
  app.register('settings:main', settings, {singleton:true, instantiate: false});
  app.inject('controller', 'settings', 'settings:main');
  app.inject('adapter', 'settings', 'settings:main');
  app.inject('model', 'settings', 'settings:main');
  app.inject('route', 'settings', 'settings:main');
  app.inject('component', 'settings', 'settings:main');
  app.advanceReadiness();
  
  // cache settings to cookie
  settings.persist('ui_settings');
}

var resolveAuth = function(settings, container, app, resp) {
  var token = settings.get('token'), loginUrl = settings.get('loginUrl');

  if (!token || (resp && resp.errorThrown)) {
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
  
  // handle special token types (e.g. cookie:)
  settings.initToken();

  // cache lookup
  if (!settings.get('token')) {
    settings.loadFromCookie("ui_settings");
  }

  // url fragment lookup (useful for debugging)
  settings.loadFromQS(window.location.hash.replace(/^#/, '') || '');

  var authUrl = settings.get("authUrl");
  if (authUrl) {

    var _bind = function(fn) {return fn.bind(this, settings, container, app);}

    settings.extendFromUrl(authUrl, {method: 'post'})
      .then(_bind(resolveAuth), _bind(resolveAuth))
      .then(_bind(registerAndAdvance)).catch(function(err) {
        settings.invalidate('ui_settings');
        throw new Error("Failed to resolve authentication params (" + err + ")");
      });; 
  }
};

export default {
  name: 'settings',
  initialize: initialize
};
