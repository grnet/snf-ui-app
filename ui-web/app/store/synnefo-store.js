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

  renameObject: function(record, old_path, new_id) {
    var adapter = this.adapterFor(record.constructor);
    return adapter.renameObject(record, old_path, new_id);
  },

  restoreObject: function(record, version){
    var adapter = this.adapterFor(record.constructor);
    return adapter.restoreObject(record, version);
  },

  moveToTrash: function(record){
    var adapter = this.adapterFor(record.constructor);
    return adapter.moveToTrash(record);
  }


});



export default SynnefoStore;
