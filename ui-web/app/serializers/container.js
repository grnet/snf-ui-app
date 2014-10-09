import DS from 'ember-data';

export default DS.RESTSerializer.extend({
  extractArray: function(store, type, payload) {
    console.log('extract Array');
    var payload_list = payload;
    payload = { containers: payload_list};
    return this._super(store, type, payload);
  },
  extractSingle: function(store, type, payload, id) {
    console.log('extract singl');
    var object_ids = [];
    var object_list = payload;
    object_list.forEach(function(el){
      object_ids.push(el.x_object_uuid);
      el.id = el.x_object_uuid;
    });
    var container = { 
      id: id,
      name: id,
      objects: object_ids,
    };
    payload = { 
      container: container, 
      objects: object_list
    };
    return this._super(store, type, payload, id);
  },
  normalizeHash: {
    containers: function(hash) {
      console.log('hash');
      hash.id = hash.name;
      hash.project = hash.x_container_policy.project;
      return hash;
    }
  },
});
