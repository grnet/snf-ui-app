import Ember from 'ember';

export default Ember.Route.extend({
  model: function(){
    return this.store.find('project', {mode: 'member'});
  },
  setupController: function(controller, model) {
    var self = this;
    controller.set('model', model);

    self.store.find('quota').then(function(q) {
      controller.set('quotas', q);
    });
  },
});
