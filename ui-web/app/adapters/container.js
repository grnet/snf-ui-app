import DS from 'ember-data';
import Ember from 'ember';

export default DS.RESTAdapter.extend({
  headers: function(){
    return {'X-Auth-Token': this.get('settings').get('token'),
              'X-Requested-With': 'XMLHttpRequest',
              'Content-Type': 'application/json'};
  }.property(),
  host: function(){
    return this.get('settings').get('storage_host');
  }.property(),
  buildURL: function(type, id, record){
    var url = [],
        host = this.get('host');
    url.push(host);
    if (id) {
      url.push(id);
    }
    url = url.join('/');
    return url;
  },
  ajaxSuccess: function(jsonPayload, jqXHR) {
    var ret = this._super(jsonPayload, jqXHR);
    return ret;
  },
  // this is a DS.adapter method
  // it could be a d DS.rest_adapter method 
  // record is returned from Store's createRecord method
  createRecord: function(store, type, record) {
    var data = this.serialize(record, { includeId: true });
    var url = this.buildURL(type.typeKey, data.name , null);
    var headers = this.get('headers');


    return new Ember.RSVP.Promise(function(resolve, reject) {
      record.get('project').then(function(project){
 
        $.extend(headers, {'X-Container-Policy-Project': project.get('id')});

        jQuery.ajax({
          type: 'PUT',
          url: url,
          // http://stackoverflow.com/questions/5061310/
          dataType: 'text',
          headers: headers,
        }).then(function(data) {
          Ember.run(null, resolve, data);
        }, function(jqXHR) {
          var response = Ember.$.parseJSON(jqXHR.responseText);
          jqXHR.then = null; // tame jQuery's ill mannered promises
          Ember.run(null, reject, jqXHR);
        });

      }, function() {
        Ember.run(null, reject, "Invalid project");
      });
    });
  },
  deleteRecord: function(store, type, record){

    var data = this.serialize(record, { includeId: true });
    var id = record.get('id');
    var url = this.buildURL(type.typeKey, id , null);
    var headers = this.get('headers');
    var timestamp = (new Date().getTime())/1000;

    return new Ember.RSVP.Promise(function(resolve, reject) {
      jQuery.ajax({
        type: 'DELETE',

        // First, we empty the container
        url: url+'?delimiter=/',
        dataType: 'text',
        headers: headers,
        data: data
      }).then(function(data) {

        jQuery.ajax({
          type: 'DELETE',
          // Then, we purge it until this time
          url: url+'?until='+timestamp,
          dataType: 'text',
          headers: headers,
          data: data
        }).then(function(data) {
          Ember.run(null, resolve, data);
        }, function(jqXHR) {
          jqXHR.then = null; // tame jQuery's ill mannered promises
          Ember.run(null, reject, jqXHR);
        });

      }, function(jqXHR) {
        jqXHR.then = null; // tame jQuery's ill mannered promises
        Ember.run(null, reject, jqXHR);
      });
    });

  },

  reassignContainer: function(record, project_id){

    var id = record.get('id');
    var url = this.buildURL('container', id , null);
    var headers = this.get('headers');

    $.extend(headers, {'X-Container-Policy-Project': project_id });
    return new Ember.RSVP.Promise(function(resolve, reject) {
      jQuery.ajax({
        type: 'POST',
        url: url,
        dataType: 'text',
        headers: headers,
      }).then(function(data) {
        Ember.run(null, resolve, data);
      }, function(jqXHR) {
        jqXHR.then = null; // tame jQuery's ill mannered promises
        Ember.run(null, reject, jqXHR);
      });
    });

  },


  emptyContainer: function(store, id){
    var url = this.buildURL('container', id , null)+'?delimiter=/';
    var headers = this.get('headers');

    return new Ember.RSVP.Promise(function(resolve, reject) {
      jQuery.ajax({
        type: 'DELETE',
        url: url,
        dataType: 'text',
        headers: headers,
      }).then(function(data) {
        Ember.run(null, resolve, data);
      }, function(jqXHR) {
        jqXHR.then = null; // tame jQuery's ill mannered promises
        Ember.run(null, reject, jqXHR);
      });
    });

  },

});

