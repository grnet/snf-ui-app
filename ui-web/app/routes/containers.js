import Ember from 'ember';
import ResetScrollMixin from 'ui-web/mixins/reset-scroll';

export default Ember.Route.extend(ResetScrollMixin, {

  model: function() {
    var query = {'account': this.get('settings.uuid')};
    var model = this.store.findQueryReloadable('container', query);
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
