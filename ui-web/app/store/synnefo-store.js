import DS from 'ember-data';
import {markRefresh} from '../snf/refresh';

var SynnefoStore = DS.Store.extend({
  
  findQueryReloadable: function(type, query) {
    return markRefresh(this, 'findQuery', type, query)
  },

  reassignContainer: function(type, record, project_id){
    var adapter = this.adapterFor(record.constructor);
    return adapter.reassignContainer(type, record, project_id);
  },

  emptyContainer: function(type, record){
    var adapter = this.adapterFor(record.constructor);
    return adapter.emptyContainer(type, record);
  },


  findByPath: function(typeName, id, current_path, preload) {
    var type = this.modelFor(typeName);
    var record = this.recordForId(type, id);
    record._current_path = current_path;
    return this._findByRecord(record, preload);
  },

  moveObject: function(record, new_id, copy_flag) {
    var adapter = this.adapterFor(record.constructor);
    return adapter.moveObject(record, new_id, copy_flag);
  },

  restoreObject: function(record, version){
    var adapter = this.adapterFor(record.constructor);
    return adapter.restoreObject(record, version);
  },

  setPublic: function(record, flag){
    var adapter = this.adapterFor(record.constructor);
    return adapter.setPublic(record, flag);
  },

  setSharing: function(record, sharing){
    var adapter = this.adapterFor(record.constructor);
    return adapter.setSharing(record, sharing);
  },

  user_catalogs: function(uuids, emails) {
    var adapter = this.container.lookup('adapter:group');
    return adapter.user_catalogs(uuids, emails);
  }

});



export default SynnefoStore;
