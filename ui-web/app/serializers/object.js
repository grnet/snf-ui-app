import DS from 'ember-data';

export default DS.RESTSerializer.extend({
  extractArray: function(store, type, payload) {
    var payload_list = payload;
    payload = { objects: payload_list};
    return this._super(store, type, payload);
  },
  /*
  extractSingle: function(store, type, payload, id) {
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
*/
  normalizeHash: {
    objects: function(hash) {
      hash.id = hash.x_object_uuid;
      return hash;
    }
  },
});
