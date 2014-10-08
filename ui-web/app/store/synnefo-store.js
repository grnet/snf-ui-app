import DS from 'ember-data';

var SynnefoStore = DS.Store.extend({
  reassignContainer: function(record){
    var adapter = this.adapterFor(record.constructor);
    adapter.reassignContainer(record);
  },
  emptyContainer: function(record){
    var adapter = this.adapterFor(record.constructor);
    adapter.emptyContainer(record);
  }

});

export default SynnefoStore;
