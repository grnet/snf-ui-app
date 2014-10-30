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
    } else {
      url.push(this.get('container_id'));
    }

    url = url.join('/');
    return url;
  },

  deleteRecord: function(store, type, record) {
    var url = this.buildURL(type.typeKey, record.get('id'), record);
    var timestamp =(new Date().getTime())/1000;
    url = url+'?until='+timestamp;
    if (record.get('is_dir')){
      url = url+'&delimiter=/';
    } 
    return this.ajax(url, "DELETE");
  },

  findQuery: function(store, type, query) {
    var container_id = store.get('container_id');
    this.set('container_id', container_id);
    return this.ajax(this.buildURL(type.typeKey), 'GET', { data: query });
  },

  renameObject: function(record, old_path, new_id, copy_flag) {
    var url = this.buildURL('object', new_id, null);
    if (record.get('is_dir')){
      url = url+'?delimiter=/';
    }
    var headers = this.get('headers');
  
    headers['Content-Type'] = record.get('content_type');

    if (copy_flag) {
      headers['X-Copy-From'] = old_path;
    } else {
      headers['X-Move-From'] = old_path;
    }

    return new Ember.RSVP.Promise(function(resolve, reject) {
      jQuery.ajax({
        type: 'PUT',
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

  restoreObject: function(record, version) {
    var name = record.get('name');
    var path = '/'+record.get('id');
    var url = this.buildURL('object', record.get('id'))+'?update=';
    var headers = this.get('headers');

    headers['X-Source-Object'] = path;
    headers['X-Source-Version'] = version;
    headers['X-Content-Range'] = 'bytes 0-/*'

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

  createRecord: function(store, type, record) {
    var data = this.serialize(record, { includeId: true });
    var url = this.buildURL(type.typeKey, record.get('id'));
    var headers = this.get('headers');

    headers['Content-Type'] = record.get('content_type');

    return new Ember.RSVP.Promise(function(resolve, reject) {
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

      });
  },

});
