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
      if(el.subdir) {
        el.name = el.subdir.slice(0, -1);
        if(payload_list.filterBy('name', el.name).length > 1) {
          el.remove = true;
        }
        else {
          el.content_type = "application/directory";
        }
      }
      el.id = container_id+'/'+el.name;
    });

    payload = { objects: payload_list.rejectBy('remove', true)};

    return this._super(store, type, payload);
  },

  extractSingle: function(store, typeClass, payload, id) {
    payload.id = id;
    payload.name =  id.split('/').splice(2).join('/');
    payload = {'object': payload};
    return this._super(store, typeClass, payload, id);
  },

});
