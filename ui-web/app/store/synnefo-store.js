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


});



export default SynnefoStore;
