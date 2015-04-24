import Ember from 'ember';
import {raw as ajax} from 'ic-ajax';

var alias = Ember.computed.alias;

var serviceUrl = function(service, url) {
  var depKey;
  url = url || 'publicURL';
  depKey = 'services.' + service + '.endpoints.' + url;
  return Ember.computed(depKey, function() {
    if (this.get('proxy.' + service)) {
      return this.get('proxy.' + service);
    } else {
      return this.get(depKey);
    }
  });
}

export default Ember.Object.extend({
  modelRefreshInterval: 5000,
  serviceCatalog: [],
  services: function() {
    var catalog = this.get('serviceCatalog');
    var map = {};
    
    catalog.forEach(function(service) {
      var name = Ember.String.camelize(service.name);
      map[name] = Ember.Object.create(service);
      var endpoints = {};
      service.endpoints.forEach(function(points) {
        var stripped;
        for (var p in points) {
          stripped = p;
          if (p.split(":").length > 1) {
            stripped = p.split(":")[1];
          }
          endpoints[stripped] = points[p];
        }
      });
      map[name].set('endpoints', Ember.Object.create(endpoints));
    });
    return map;
  }.property('serviceCatalog'),

  loginUrl: function() {
    var ui, loc, login;
    ui = this.get('services.astakosAccount.endpoints.uiURL');
    loc = window.location.toString();
    login = ui.replace(/\/$/, '') + '/login/?next=' + loc;
    return login;
  }.property('services.astakosAccount.endpoints.uiURL'),

  authUrl: function() {
    var auth = this.get('auth_url');
    return auth.replace(/\/$/g, '') + '/' + 'tokens/'
  }.property('auth_url'),

  extendFromUrl: function(url, opts) {
   return ajax(url, opts).then(function(data) {
     this.set('serviceCatalog', data.response.access.serviceCatalog);
     return this;
   }.bind(this));
  },

  resolveUser: function() {
    return ajax({
      url: this.get('authUrl'),
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      type: 'json',
      // TODO: also permit login using username/password
      data: JSON.stringify({auth:{token:{id: this.get('token')}}})
    }).then(function(data) {
      this.set('tokenInfo', data.response.access.token);
      this.set('user', data.response.access.user);
    }.bind(this));
  },

  // aliases
  uuid: alias('tokenInfo.tenant.id'),
  service_name: alias('branding.SERVICE_NAME'),
  logo_url: alias('branding.STORAGE_LOGO_URL'),

  storage_url: serviceUrl('pithosObjectStore'),
  storage_host: function() {
    return this.get('storage_url') + '/' + this.get('uuid');
  }.property('storage_url', 'uuid'),
  storage_view_url: function() {
    return this.get('services.pithosObjectStore.endpoints.uiURL') + '/view/' + this.get('uuid');
  }.property('services.pithosObjectStore.endpoints.uiURL'),
  account_url: serviceUrl('astakosAccount')

});
