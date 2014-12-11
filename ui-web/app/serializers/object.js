import DS from 'ember-data';

export default DS.RESTSerializer.extend({
  extractArray: function(store, type, payload) {
    var payload_list = payload;
    var container_id = store.get('container_id');
    payload_list.forEach(function(el){
      el.public_link = el.x_object_public;
      el.sharing = el.x_object_sharing;
      delete el.x_object_public;
      delete el.x_object_sharing;
      el.id = container_id+'/'+el.name;
    });
    payload = { objects: payload_list};
    return this._super(store, type, payload);
  },

 
  extractSingle: function(store, type, payload, id) {
    payload.public_link = payload.x_object_public;
    payload.sharing = payload.x_object_sharing;
    delete payload.x_object_sharing;

    return this._super(store, type, payload, id);
  }

});
