import Ember from 'ember';
import {raw as ajax} from 'ic-ajax';


export default Ember.Object.extend({
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
      this.set('tokenInfo', data.response.token);
    }.bind(this));
  }

});
