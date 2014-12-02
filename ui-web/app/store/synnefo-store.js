import DS from 'ember-data';

var SynnefoStore = DS.Store.extend({

  reassignContainer: function(record, project_id){
    var adapter = this.adapterFor(record.constructor);
    return adapter.reassignContainer(record, project_id);
  },

  emptyContainer: function(record, project_id){
    var adapter = this.adapterFor(record.constructor);
    var container_id = record.id;
    return adapter.emptyContainer(record, container_id);
  },


  findByPath: function(typeName, id, current_path, preload) {
    var type = this.modelFor(typeName);
    var record = this.recordForId(type, id);
    record._current_path = current_path;
    return this._findByRecord(record, preload);
  },

  moveObject: function(record, old_path, new_id, copy_flag) {
    var adapter = this.adapterFor(record.constructor);
    return adapter.moveObject(record, old_path, new_id, copy_flag);
  },

  restoreObject: function(record, version){
    var adapter = this.adapterFor(record.constructor);
    return adapter.restoreObject(record, version);
  },

  setPublic: function(record, flag){
    var adapter = this.adapterFor(record.constructor);
    return adapter.setPublic(record, flag);
  },

  user_catalogs: function(uuids, emails) {
    var adapter = this.container.lookup('adapter:group');
    return adapter.user_catalogs(uuids, emails);
  }

});



export default SynnefoStore;
