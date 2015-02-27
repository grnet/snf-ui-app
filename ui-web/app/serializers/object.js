import DS from 'ember-data';

export default DS.RESTSerializer.extend({
  keyForAttribute: function(attr) {
    var mapping = {
      'public_link': 'x_object_public',
      'sharing': 'x_object_sharing'
    };
    return mapping[attr] || attr;
  },


  extractArray: function(store, type, payload) {
    var container_id = payload.container_id;
    delete payload.container_id;
    var payload_list = payload;
    payload_list.forEach(function(el){
      el.modified_by = el.x_object_modified_by;
      delete el.x_object_modified_by;
      el.id = container_id+'/'+el.name;
    });
    payload = { objects: payload_list};
    return this._super(store, type, payload);
  },

 
  extractSingle: function(store, type, payload, id) {
    payload.modified_by = payload.x_object_modified_by;
    delete payload.x_object_modified_by;

    return this._super(store, type, payload, id);
  }

});
