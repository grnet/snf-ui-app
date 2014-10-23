import DS from 'ember-data';

export default DS.RESTSerializer.extend({
  extractArray: function(store, type, payload) {
    var init_arr = payload['versions'];
    var versions = []; 
    init_arr.forEach(function(el){
      var a = {};
      a.id = el[0];
      a.timestamp = el[1];
      versions.push(a);
    });
    payload = { versions: versions};
    return this._super(store, type, payload);
  },
});
