import DS from 'ember-data';

export default DS.RESTSerializer.extend({
  extractArray: function(store, type, payload) {
    var payload_list = payload;
    var container_id = store.get('container_id');
    payload_list.forEach(function(el){
      el.public_link = el.x_object_public;
      delete el.x_object_public;
      el.id = container_id+'/'+el.name;
    });
    payload = { objects: payload_list};
    return this._super(store, type, payload);
  },

 
  extractSingle: function(store, type, payload, id) {
    payload.public_link = payload.x_object_public;
    delete payload.x_object_public;

    return this._super(store, type, payload, id);
  }

});
