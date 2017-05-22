import DS from 'ember-data';
import StorageAdapter from 'snf-ui/snf/adapters/storage';


// Permit model updates while model is in `inFlight` state.  May result in
// weird side effects !!!
DS.RootState.deleted.inFlight.pushedData = Ember.K;

var set = Ember.set;
var get = Ember.get;


var SynnefoStore = DS.Store.extend({
  
  findQueryReloadable: function(type, query) {
    return this.markRefresh(this, 'findQuery', type, query);
  },

  findAllReloadable: function(type) {
    return this.markRefresh(this, 'findAll', type);
  },

  reloadRecordArray: function(arr) {
    var store = arr.get('store');
    var type = arr.get('type');
    var query = arr.get('query');
    var adapter = store.adapterFor(type);

    var ctx = StorageAdapter.prototype;
    if (query == undefined) {
      return ctx._finder_findAll.call(adapter, adapter, store, type, false);
    }
    return ctx._finder_findQuery.call(adapter, adapter, store, type, query, arr, false); 
  },

  // Mark a store promise result as reloadable.
  markRefresh: function(context, method, type, query, ...args) {
    var promise, params;
    var self = this;
    promise = context[method](type, query, true); // TODO: introspect return value
    promise.then(function(res) {
      res.set('query', query);
      res.update = function() { return self.reloadRecordArray(res); }
      return res;
    });
    return promise;
  },

  reassignContainer: function(type, record, project_id){
    var adapter = this.adapterFor(record.constructor);
    return adapter.reassignContainer(type, record, project_id);
  },

  emptyContainer: function(type, record){
    var adapter = this.adapterFor(record.constructor);
    return adapter.emptyContainer(type, record);
  },

  findQuery: function(typeName, query, update) {
    var type = this.modelFor(typeName);
    var array = this.recordArrayManager
      .createAdapterPopulatedRecordArray(type, query);

    var adapter = this.adapterFor(type);

    Ember.assert("You tried to load a query but you have no adapter (for " + type + ")", adapter);
    Ember.assert("You tried to load a query but your adapter does not implement `findQuery`", typeof adapter.findQuery === 'function');
    
    return DS.PromiseArray.create({
      promise: StorageAdapter.prototype._finder_findQuery.call(adapter, adapter, this, type, query, array, update)
    });
  },

  _fetchAll: function(type, array) {
    var adapter = this.adapterFor(type);
    var sinceToken = this.typeMapFor(type).metadata.since;

    Ember.set(array, 'isUpdating', true);

    Ember.assert("You tried to load all records but you have no adapter (for " + type + ")", adapter);
    Ember.assert("You tried to load all records but your adapter does not implement `findAll`", typeof adapter.findAll === 'function');

    var ctx = StorageAdapter.prototype;
    return DS.PromiseArray.create({
      promise: ctx._finder_findAll.call(adapter, adapter, this, type)
    });
  },

  fetchRecord: function(record) {
    var type = record.constructor;
    var id = get(record, 'id');
    var adapter = this.adapterFor(type);

    Ember.assert("You tried to find a record but you have no adapter (for " + type + ")", adapter);
    Ember.assert("You tried to find a record but your adapter (for " + type + ") does not implement 'find'", typeof adapter.find === 'function');

    var ctx = StorageAdapter.prototype;
    return ctx._finder_find.call(adapter, adapter, this, type, id, record);
  },


  findByPath: function(typeName, id, current_path, preload) {
    var type = this.modelFor(typeName);
    var record = this.recordForId(type, id);
    record._current_path = current_path;
    return this._findByRecord(record, preload);
  },

  moveObject: function(record, new_id, copy_flag, source_account) {
    var snapshot = record._createSnapshot();
    var adapter = this.adapterFor(snapshot.type);
    return adapter.moveObject(snapshot, new_id, copy_flag, source_account);
  },

  restoreObject: function(record, version){
    var snapshot = record._createSnapshot();
    var adapter = this.adapterFor(snapshot.type);
    return adapter.restoreObject(snapshot, version);
  },

  setPublic: function(record, flag){
    var snapshot = record._createSnapshot();
    var adapter = this.adapterFor(snapshot.type);
    return adapter.setPublic(snapshot, flag);
  },

  setSharing: function(record, sharing){
    var snapshot = record._createSnapshot();
    var adapter = this.adapterFor(snapshot.type);
    return adapter.setSharing(snapshot, sharing);
  },

  readFile: function(record, sharing){
    var snapshot = record._createSnapshot();
    var adapter = this.adapterFor(snapshot.type);
    return adapter.readFile(snapshot, sharing);
  },

  updateFile: function(record, content, sharing){
    var snapshot = record._createSnapshot();
    var adapter = this.adapterFor(snapshot.type);
    return adapter.updateFile(snapshot, content, sharing);
  },

  user_catalogs: function(uuids, emails) {
    var adapter = this.container.lookup('adapter:group');
    return adapter.user_catalogs(uuids, emails);
  }

});



export default SynnefoStore;
