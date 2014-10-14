import Ember from 'ember';

export default Ember.Route.extend({
  model: function(params){
    // if path is not set, then default path is current folder '/'
    var current_path = params.current_path ? params.current_path : '/';
    var container_id = params.container_id;
    return this.store.find('object', {container_id: container_id, path: current_path});
    
  },

  renderTemplate: function() {
    this.render('objects');
  },

  controllerName: 'objects',

});
