import Ember from 'ember';

export default Ember.Route.extend({
  model: function(params){

    // if path is not set, then default path is current folder '/'
    var path = params.path ? params.path : '/';
    var query = {
      id: params.container_id,
      path: path
    };
    return this.store.find('container', params.container_id);
  },
  setupController: function(controller, model) {
    model.reload();
    this._super(controller, model);
  },
});
