import StorageAdapter from 'ui-web/snf/adapters/storage';
import Ember from 'ember';

export default StorageAdapter.extend({
  
  buildURL: function(type, account, id, record) {
    var url = this._super(type, account, record);

    if (id) { url = url + "/" + encodeURIComponent(id.replace(/^\//, '')); }
    url = url.replace(/([^:])\/\//g, "$1/");
    return url;
  },

  findAll: function(store, type, sinceToken) {
    var query;

    if (sinceToken) {
      query = { since: sinceToken };
    }
    
    var account = this.get('account');
    return this.ajax(this.buildURL(type.typeKey, account), 'GET', { data: query });
  },

  /*
   * In order to find a container by account/name pass `{account}/{name}` 
   * as id.
   */
  find: function(store, type, id, record) {
    var parts, account;

    if (id && id.match("/")) {
      parts = id.split("/");
      id = parts[1];
      account = parts[0];
      record.set("id", id);
    }

    if (!account) { account = this.get('account'); }
      
    return this.ajax(this.buildURL(type.typeKey, account, id, record), 'GET');
  },

  findQuery: function(store, type, query) {
    var account = query.account || this.get('account');
    delete query.account;
    var url = this.buildURL(type.typeKey, account);
    var headers = this.get('headers'); 
    return this.ajax(url, 'GET', { data: query, headers: headers });
  },

  createRecord: function(store, type, record) {
    var self = this;
    var account = this.get('account');

    return new Ember.RSVP.Promise(function(resolve, reject) {
      record.get('project').then(function(project){
        var headers = {};
        headers['X-Container-Policy-Project'] =  project.get('id');
        headers['Accept'] =  'text/plain';
        
        return self.ajax(self.buildURL(type.typeKey, account, record.get('id'), record), "PUT", {
          headers: headers
        }).then(function(data){
          Ember.run(null, resolve, data);
        }, function(jqXHR) {
          jqXHR.then = null;
          Ember.run(null, reject, jqXHR);
        });
      }, function() {
        Ember.run(null, reject, "Invalid project");
      });
    });
  },

  deleteRecord: function(store, type, record) {
    var timestamp = (new Date().getTime())/1000;
    var account = this.get('account');

    return this.ajax(this.buildURL(type.typeKey, account, record.get('id'))+'?until='+timestamp, "DELETE");
  },

  reassignContainer: function(type, record, project_id){
    var headers = {};
    var account = this.get('account');
    headers['X-Container-Policy-Project'] =  project_id;
    headers['Accept'] =  'text/plain';

    return this.ajax(this.buildURL(type, account, record.get('id')), "POST", {
      headers: headers
    });
  },

  emptyContainer: function(type, record) {
    var account = this.get('account');
    return this.ajax(this.buildURL(type, account, record.get('id'))+'?delimiter=/', "DELETE");
  },

});

