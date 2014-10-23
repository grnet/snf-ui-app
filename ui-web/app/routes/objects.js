import Ember from 'ember';

export default Ember.Route.extend({
  model: function(params){
    var container_id = this.modelFor('container').get('name');
    var current_path = params.current_path ? params.current_path : '/';
    this.store.set('container_id', container_id);
    this.set('current_path', current_path);
    return this.store.find('object', {path: current_path});
  },
  setupController: function(controller,model){
    controller.set('model', model);
    var container_id = this.modelFor('container').get('name');
    controller.set('container_id', container_id);
    controller.set('current_path', this.get('current_path'));
  },
  actions:  {
    showObjectVersions: function(model){
      return this.render('object/versions', {
        into: 'objects',
        outlet: 'versions',
        controller: 'object/versions',
        model: model
      });
    },
    hideObjectVersions: function(){
      return this.disconnectOutlet({
        outlet: 'versions',
        parentView: 'objects'
      });
    },
 
  }
});
