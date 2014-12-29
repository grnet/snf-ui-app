import StorageAdapter from 'ui-web/snf/adapters/storage';
import Ember from 'ember';

export default StorageAdapter.extend({

  createRecord: function(store, type, record) {
    var self = this;
    var headers = this.get('headers');

    return new Ember.RSVP.Promise(function(resolve, reject) {
      record.get('project').then(function(project){
        headers['X-Container-Policy-Project'] =  project.get('id');
        headers['Accept'] =  'text/plain';

        return self.ajax(self.buildURL(type.typeKey, record.get('id'), record), "PUT");
      }, function() {
        Ember.run(null, reject, "Invalid project");
      });
    });
  },

  deleteRecord: function(store, type, record) {
    var id = record.get('id');
    var timestamp = (new Date().getTime())/1000;
    var headers = this.get('headers');
    headers['Accept'] =  'text/plain';

    return this.ajax(this.buildURL(type.typeKey, id, record)+'?until='+timestamp, "DELETE");
  },

  reassignContainer: function(type, record, project_id){
    var id = record.get('id');
    var headers = this.get('headers');
    headers['X-Container-Policy-Project'] =  project_id;
    headers['Accept'] =  'text/plain';

    return this.ajax(this.buildURL(type, id, record), "POST");
  },

  emptyContainer: function(type, record) {
    var id = record.get('id');
    var headers = this.get('headers');
    headers['Accept'] =  'text/plain';

    return this.ajax(this.buildURL(type, id, record)+'?delimiter=/', "DELETE");
  },

});

