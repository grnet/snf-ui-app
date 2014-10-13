import Ember from 'ember';

export default Ember.Route.extend({
  model: function(params){
    // if path is not set, then default path is current folder '/'
    
    var current_path = params.current_path ? params.current_path : '/';
    //var container_id = params.container_id;
    //return this.store.findByPath('container', container_id, current_path);
    return this.store.find('object', {path: current_path});
    
  },

  renderTemplate: function() {
    this.render('objects');
  },
  controllerName: 'objects',

});
