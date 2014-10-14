import Ember from 'ember';

export default Ember.Route.extend({
  model: function(params){
    var container_id = this.modelFor('container').get('name');
    var current_path = params.current_path ? params.current_path : '/';

    return this.store.find('object', {container_id: container_id, path: current_path});
    //return this.store.find('object', {path: current_path});
  },
  /*
  setupController: function(controller, model) {
    controller.set('model', model);
    this.store.find('project', controller.settings.get('uuid')).then(function(p) {
      controller.set('systemProject', p);
    });
  },
  ajaxSuccess: function(jsonPayload, jqXHR) {
    var ret = this._super(jsonPayload, jqXHR);
    ret.myCustomValue = jqXHR.headers['Server'];
    return ret;
  }
  */
});
