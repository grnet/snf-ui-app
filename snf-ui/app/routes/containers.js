import Ember from 'ember';
import ResetScrollMixin from 'snf-ui/mixins/reset-scroll';

export default Ember.Route.extend(ResetScrollMixin, {

  needs: ['application'],
  model: function() {
    var model = this.container.lookup('controller:application').get('containers');
    return model;
  },

  renderTemplate: function(params){
    this.render('containers');
    this.render('bar/rt-containers', {
      into: 'application',
      outlet: 'bar-rt',
      controller: 'containers',
    });
    this.render('bar/lt-containers', {
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
