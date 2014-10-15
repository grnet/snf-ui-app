import DS from 'ember-data';

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

    if (this.get('container_id')) {
      url.push(this.get('container_id'));
    }
    if (id) {
        url.push(id);
    }
    url = url.join('/');
    return url;
  },
  deleteRecord: function(store, type, record) {
    var id = record.get('name');
    return this.ajax(this.buildURL(type.typeKey, id, record), "DELETE");
  },

  findQuery: function(store, type, query) {
    var container_id = store.get('container_id');
    this.set('container_id', container_id);
    return this.ajax(this.buildURL(type.typeKey, null, null), 'GET', { data: query });
  },

  renameObject: function(record, old_path, new_name) {
    var url = this.buildURL('object', new_name, null);
    if (record.get('is_dir')){
      url = url+'?delimiter=/'
    }
    var headers = this.get('headers');

    $.extend(headers, {
      'X-Move-From': old_path,
      'Content-Type': record.get('content_type'), 
    });
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

});
