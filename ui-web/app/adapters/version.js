import StorageAdapter from 'ui-web/snf/adapters/storage';

export default StorageAdapter.extend({

  findQuery: function(store, type, query) {
    var parts, id;
    var object_id = store.get('object_id');
    delete store.object_id;
    parts = object_id.split('/');
    parts.shift();
    id = parts.join('/');
    return this.ajax(this.buildURL(type.typeKey, id), 'GET', { data: query });
  },
});
