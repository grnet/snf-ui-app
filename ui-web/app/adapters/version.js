import StorageAdapter from 'ui-web/snf/adapters/storage';

export default StorageAdapter.extend({

  findQuery: function(store, type, query) {
    var object_id = store.get('object_id');
    delete store.object_id;

    return this.ajax(this.buildURL(type.typeKey, object_id), 'GET', { data: query });
  },
});
