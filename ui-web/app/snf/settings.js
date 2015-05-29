import Ember from 'ember';
import {raw as ajax} from 'ic-ajax';
import config from '../config/environment';

var alias = Ember.computed.alias;
var qsToObject = function(qs) {
  return JSON.parse('{"' + decodeURI(qs).replace(/"/g, '\\"').replace(/&/g, '","').replace(/=/g,'":"') + '"}');
}

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

  loadFromQS: function(qs) {
    try {
      var obj = qsToObject(qs);
    } catch (err) {};
    this.setProperties(obj);
  },
  
  loadFromCookie: function(name) {
    var reg, value, matched;
    reg = new RegExp(name+'=(.*?);');
    matched = document.cookie.toString().match(reg);
    if (matched && matched[1]) {
      value = decodeURIComponent(matched[1]);
      value = JSON.parse(value);
      this.setProperties(value);
    }
  },

  persist: function(name, data, props) {
    var expires, value;
    props = props || ['auth_url', 'token'];
    expires = (new Date())
    expires.setDate(expires.getDate() + 1);
    value = JSON.stringify(this.getProperties.apply(this, props));
    value = encodeURIComponent(value);
    document.cookie = name + "=" + value + "; path=" 
      + (config.baseURL || '/') + ";" 
      + expires.toUTCString();
  },

  invalidate: function(name) {
    document.cookie = name + "=; path=" + (config.baseURL || '/') + ";-1";
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
  account_url: serviceUrl('astakosAccount'),

  // Theme settings
  // `name` is the css file name (without the .css extension)
  // `color` is the primary color of the theme and
  // `icon` is the icon that will be visible in the templates
  themes: [{
    'name': 'ui-web',
    'color': '#00a551',
    'icon': 'birthday-cake',
  }, {
    'name': 'theme-funky',
    'color': '#3aa6f4',
    'icon': 'fa-life-ring',
  }] 

});
