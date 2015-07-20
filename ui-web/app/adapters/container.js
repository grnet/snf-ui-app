import StorageAdapter from 'ui-web/snf/adapters/storage';
import Ember from 'ember';

export default StorageAdapter.extend({
  
  buildURL: function(type, account, id, snapshot) {
    var url = this._super(type, account, snapshot);

    if (id) { url = url + "/" + encodeURIComponent(id).replace(/\%2f/gi, '/'); }
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
  find: function(store, type, id, snapshot) {
    var parts, account;

    // Todo: Update the code below
    if (id && id.match("/")) {
      parts = id.split("/");
      id = parts[1];
      account = parts[0];
      snapshot["id"] = id;
    }

    if (!account) { account = this.get('account'); }
      
    return this.ajax(this.buildURL(type.typeKey, account, id, snapshot), 'GET');
  },

  findQuery: function(store, type, query) {
    var account = query.account || this.get('account');
    delete query.account;
    var url = this.buildURL(type.typeKey, account);
    var headers = this.get('headers'); 
    var payload = this.ajax(url, 'GET', { data: query, headers: headers });
    return payload.then(function(p){
      p.account = account;
      return p;
    });
  },

  createRecord: function(store, type, snapshot) {
    var self = this;
    var project = snapshot.belongsTo('project');
    var headers = {};

    headers['X-Container-Policy-Project'] =  project.id;
    headers['Accept'] =  'text/plain';

    return this.ajax(self.buildURL(snapshot.typeKey, null, snapshot.id, snapshot), "PUT", {
      headers: headers
    });
  },

  deleteRecord: function(store, type, snapshot) {
    var timestamp = (new Date().getTime())/1000;
    return this.ajax(this.buildURL(type.typeKey, null, snapshot.id)+'?until='+timestamp, "DELETE");
  },

  reassignContainer: function(type, snapshot, project_id){
    var headers = {};
    headers['X-Container-Policy-Project'] =  project_id;
    headers['Accept'] =  'text/plain';

    return this.ajax(this.buildURL(type, null,  snapshot.get('id')), "POST", {
      headers: headers
    });
  },

  emptyContainer: function(type, snapshot) {
    return this.ajax(this.buildURL(type, null, snapshot.get('id'))+'?delimiter=/', "DELETE");
  },

});

