import DS from 'ember-data';

export default DS.RESTAdapter.extend({
  headers: function(){
    return {'X-Auth-Token': this.get('settings').get('token'),
              'X-Requested-With': 'XMLHttpRequest',
              'Content-Type': 'application/json'};
  }.property(),

  host: function(){
    return this.get('settings').get('storage_host')+'/pithos';
  }.property(),

  buildURL: function(type, id, record){
    var url = [],
        host = this.get('host');
    url.push(host);
    /*
    if (id) {
        url.push(id);
    }
    */
    url = url.join('/');
    console.log(url);
    return url;
  }
});
