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
    //var container_id = store.get('container_id');
    var id = record.get('name');
    return this.ajax(this.buildURL(type.typeKey, id, record), "DELETE");
  },

  findQuery: function(store, type, query) {
    //var container_id = query.container_id;
    var container_id = store.get('container_id');
    this.set('container_id', container_id);
    //delete query.container_id;
    return this.ajax(this.buildURL(type.typeKey, null, null), 'GET', { data: query });
  },
});
