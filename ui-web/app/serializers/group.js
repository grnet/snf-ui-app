import DS from 'ember-data';

export default DS.RESTSerializer.extend({
  extractArray: function(store, type, payload) {
    var groups = payload.groups;
    payload = { groups: groups};
    return this._super(store, type, payload);
  },
  extractSingle: function(store, type, payload, id) {
    var object_ids = [];
    var object_list = payload;

    object_list.forEach(function(el){
      var obj_id = id+'/'+el.name;
      object_ids.push(obj_id);
      el.id = obj_id;
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
      hash.id = hash.name;
      hash.project = hash.x_container_policy.project;
      return hash;
    }
  },
});
