import Ember from 'ember';

export default Ember.Route.extend({
  actions: {
    loading: function(transition, originRoute) {
      console.log('loading!!!!!!!!!!');
      return true;
    }
  }
});
