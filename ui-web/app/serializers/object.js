import DS from 'ember-data';

export default DS.RESTSerializer.extend({
  keyForAttribute: function(attr) {
    var mapping = {
      'public_link': 'x_object_public',
      'sharing': 'x_object_sharing',
      'allowed_to': 'x_object_allowed_to',
      'shared_by': 'x_object_shared_by',
      'ancestor_sharing': 'ancestor_sharing'
    };
    return mapping[attr] || attr;
  },

  keyForRelationship: function(attr, belongsTo) {
    var mapping = {
      'modified_by': 'x_object_modified_by'
    };
    return mapping[attr] || attr;
  },

  extractArray: function(store, type, payload) {
    var container_id = payload.container_id;
    delete payload.container_id;
    var payload_list = payload;
    payload_list.forEach(function(el){
      el.id = container_id+'/'+el.name;
    });
    payload = { objects: payload_list};
    return this._super(store, type, payload);
  },


});
