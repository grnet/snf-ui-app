import Ember from 'ember';
import ResetScrollMixin from '../mixins/reset-scroll';

export default Ember.Route.extend(ResetScrollMixin, {

  model: function() {
    var model = this.store.findQueryReloadable('container', {});
    return model;
  },

  renderTemplate: function(params){
    this.render('containers');
    this.render('bar/rt-containers', {
      into: 'application',
      outlet: 'bar-rt',
      controller: 'containers',
    });
    this.render('global/breadcrumbs', {
      into: 'application',
      outlet: 'bar-lt',
      controller: 'containers',
    });
  },

  actions: {
    refreshRoute: function(){
      this.refresh();
    }
 
  }

});
