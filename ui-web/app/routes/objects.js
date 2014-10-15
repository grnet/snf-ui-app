import Ember from 'ember';

export default Ember.Route.extend({
  model: function(params){
    var container_id = this.modelFor('container').get('name');
    var current_path = params.current_path ? params.current_path : '/';
    this.store.set('container_id', container_id);
    return this.store.find('object', {path: current_path});
  },
  setupController: function(controller,model){
    controller.set('model', model);
    var container_id = this.modelFor('container').get('name');
    controller.set('container_id', container_id);
  }
});
