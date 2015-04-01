import Ember from 'ember';
import ResetScrollMixin from '../mixins/reset-scroll';

export default Ember.Route.extend(ResetScrollMixin,{
  model: function(){
    return this.store.find('container');
  },

  setupController: function(controller, model) {
    controller.set('model', model);
    this.store.find('project', controller.settings.get('uuid')).then(function(p) {
      controller.set('systemProject', p);
    });
  },
  renderTemplate: function(){
    this.render('containers-grid');
    this.render('bar-lt-containers', {
      into: 'application',
      outlet: 'bar-lt',
      controller: 'containers',
    });
  }


});
