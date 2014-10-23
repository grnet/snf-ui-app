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

  buildURL: function(type, container_id, id, record){
    var url = [],
        host = this.get('host');
    url.push(host);

    if (container_id){
      url.push(container_id);
    }
    
    if (id) {
      url.push(id);
    }

    url = url.join('/');
    return url;
  },
  
  findQuery: function(store, type, query) {
    var container_id = store.get('container_id');
    var name = store.get('object_name');
    delete store.object_name;
    return this.ajax(this.buildURL(type.typeKey, container_id, name), 'GET', { data: query });
  },


});
