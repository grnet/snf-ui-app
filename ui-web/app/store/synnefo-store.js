import DS from 'ember-data';

var SynnefoStore = DS.Store.extend({
  reassignContainer: function(){
    console.log('store reassing');
  },
  emptyContainer: function(){
    console.log('empty container');
  }

});

export default SynnefoStore;
