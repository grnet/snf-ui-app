import StorageAdapter from 'ui-web/snf/adapters/storage';
import Ember from 'ember';

export default StorageAdapter.extend({

  createRecord: function(store, type, record) {
    var self = this;

    return new Ember.RSVP.Promise(function(resolve, reject) {
      record.get('project').then(function(project){
        var headers = {};
        headers['X-Container-Policy-Project'] =  project.get('id');
        headers['Accept'] =  'text/plain';

        return self.ajax(self.buildURL(type.typeKey, record.get('id'), record), "PUT", {
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

    return this.ajax(this.buildURL(type.typeKey, record.get('id'))+'?until='+timestamp, "DELETE");
  },

  reassignContainer: function(type, record, project_id){
    var headers = {};
    headers['X-Container-Policy-Project'] =  project_id;
    headers['Accept'] =  'text/plain';

    return this.ajax(this.buildURL(type, record.get('id')), "POST", {
      headers: headers
    });
  },

  emptyContainer: function(type, record) {
    return this.ajax(this.buildURL(type, record.get('id'))+'?delimiter=/', "DELETE");
  },

});

