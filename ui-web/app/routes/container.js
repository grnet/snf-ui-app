import Ember from 'ember';

export default Ember.Route.extend({
  model: function(params){
    return this.store.find('container', params.params_id);
  },
  setupController: function(controller, model) {
    model.reload();
    this._super(controller, model);
  },

});
