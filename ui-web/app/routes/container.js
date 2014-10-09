import Ember from 'ember';

export default Ember.Route.extend({
  model: function(params){
    var path = params.path ? params.path : '/';

    console.log('>>>PATH', path);
    return this.store.find('container', params.container_id);
  },
  setupController: function(controller, model) {
    model.reload();
    this._super(controller, model);
  },

});
