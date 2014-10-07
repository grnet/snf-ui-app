import Ember from 'ember';

export default Ember.Route.extend({
  setupController: function(controller, model) {
    model.reload();
    this._super(controller, model);
  }
});
