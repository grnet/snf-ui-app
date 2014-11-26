import Ember from 'ember';

export default Ember.Route.extend({
  model: function(){
    return this.store.find('group');
  },
  actions: {
    refreshRoute: function(){
      this.refresh();
    }
  }

});
