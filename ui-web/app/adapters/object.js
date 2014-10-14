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

  buildURL: function(type, id, record, container_id){
    var url = [],
        host = this.get('host');
    url.push(host);

    if (container_id) {
      url.push(container_id);
    }
    if (id) {
        url.push(id);
    }
    url = url.join('/');
    console.log(url, 'url');
    return url;
  },

  findQuery: function(store, type, query) {
    var container_id = query.container_id;
    delete query.container_id;
    return this.ajax(this.buildURL(type.typeKey,null, null, container_id), 'GET', { data: query });
  },
});
