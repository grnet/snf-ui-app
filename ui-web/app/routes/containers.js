import Ember from 'ember';

export default Ember.Route.extend({
  model: function(){
    return this.store.find('container');
  },
  setupController: function(controller, model) {
    controller.set('model', model);
    this.store.find('project', controller.settings.get('uuid')).then(function(p) {
      controller.set('systemProject', p);
    });
  }
});
