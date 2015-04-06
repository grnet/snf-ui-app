import DS from 'ember-data';
import Ember from 'ember';

var forEach = Ember.ArrayPolyfills.forEach;

/* 
 * A base rest adapter for all synnefo apps.
 *
 * - Uses settings object to resolve authentication token and host urls.
 * - Exposes typePathMap attribute to easily define simple type to path 
 *   mappings.
 * - Extends request headers using extraHeaders hash attribute when set.
 */
export default DS.RESTAdapter.extend({
  
  authRequired: true,
  apiKey: null,
  settings: {},
   
  typePathMap: {},
  typeHeadersMap: {},
  methodHeadersMap: {},
  extraHeaders: {},

  pathForType: function(type) {
    if (type in this.get('typePathMap')) { 
      return this.get('typePathMap')[type];
    } else {
      return this._super(type);
    }
  },

  /*
   * Sets common API headers. Including authentication token if adapter is 
   * tagged with authRequired: true.
   *
   * TODO: How to resolve per request authRequired ?
   */
  headers: function() {
    var token = null;
    var hash = {
      'X-Requested-With': 'XMLHttpRequest',
      'Content-Type': 'application/json'
    };

    if (this.get('authRequired')) {
      hash['X-Auth-Token'] = this.get('settings.token');
    }

    var extra = this.get('extraHeaders');
    if (extra) { _.extend(hash, extra); }
    
    return hash
  }.property('settings.token'),
  
  /*
   * Expects settings in the following form
   *
   * SETTINGS = {
   *   'storage_url': 'https://synnefo.cloud/storage/api/v2'
   * }
   */
  host: function() {
    var hosts = this.get('settings');
    var key = this.get('apiKey') + '_url';
    if (hosts) { 
      return hosts.get(key);
    }
    throw Error("No key '%@' found in '%@'".fmt(key, hosts));
  }.property('settings'),
   
  /*
   * Extend ajaxOptions to allow per model type headers to be set by adapters.
   */
  ajaxOptions: function(url, type, options) {
    var hash = options || {};
    hash.url = url;
    hash.type = type;
    hash.dataType = 'json';
    hash.context = this;

    if (hash.data && type !== 'GET') {
      hash.contentType = 'application/json; charset=utf-8';
      hash.data = JSON.stringify(hash.data);
    }

    var commonHeaders = this.get('headers');
    var customHeaders = (options && options.headers) || {};
    var headers = _.extend({}, commonHeaders, customHeaders);

    // hacky way to resolve model type from this context
    var adapterType = this.constructor.toString().split(":")[1];
    var typeHeaders = this.headersForType(adapterType);
    if (typeHeaders) { _.extend(headers, typeHeaders); }
    var methodHeaders = this.headersForMethod(type); // type is GET, POST etc.
    if (methodHeaders) { _.extend(headers, methodHeaders); }

    var typeOptions = this.optionsForType && this.optionsForType(adapterType, 
                                                                 hash);
    if (typeOptions) { _.extend(hash, typeOptions); }
      
    if (headers !== undefined) {
      hash.beforeSend = function (xhr) {
        forEach.call(Ember.keys(headers), function(key) {
          xhr.setRequestHeader(key, headers[key]);
        });
      };
    }
    
    // text/plain answers should be resolved with `text` dataType
    if ('Accept' in headers && headers['Accept'].indexOf('text/plain') === 0) {
      hash.dataType = 'text';
    } 

    return hash;
  },

  headersForType: function(type) {
    var headersMap = this.get('typeHeadersMap');
    if (headersMap && headersMap[type]) {
      return headersMap[type];
    }
    return {};
  },

  headersForMethod: function(method) {
    var headersMap = this.get('methodHeadersMap');
    if (headersMap && headersMap[method]) {
      return headersMap[method];
    }
    return {};
  },

  /*
   * Helper method to facilitate fast resolve of record urls with queryset 
   * support.
   *
   * The method requires `modelName` property to exist to the adapter class in 
   * order to avoid injecting model type per method invocation.
   * 
   * Usage:
   *
   * this.ajax(this.urlFor(null, {'param': 1}), 'POST')
   * POST to /api/modelName?param=1
   *
   * this.ajax(this.urlFor(12, {'verbose': 1, 'filter': 2}, 'GET')
   * GET to /api/modelName/12?verbose=1&filter=2
   *
   */

  urlFor: function(id, params) {
    if (id === null || id === undefined) { id = null; }
    params = params || null;
    var append = "";
    if (params && params.path) { 
      append = params.path;
      delete params.path;
    }
    if (params !== null) {
      params = "?" + Ember.$.param(params);
    } else {
      params = "";
    }
    var modelName = this.get('modelName');
    var msg = 'urlFor requires `modelName` parameter to be set to the adapter class.';
    Ember.assert(msg, modelName);
    return this.buildURL(modelName, id) + params;
  },

});
