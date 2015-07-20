import Ember from 'ember';
import ResetScrollMixin from 'ui-web/mixins/reset-scroll';
import EscapedParamsMixin from 'ui-web/mixins/escaped-params';

export default Ember.Route.extend(EscapedParamsMixin, ResetScrollMixin,{
  escapedParams: ['container_name'],

  model: function(params){
    let id = this.get('settings.uuid') + '/' + params.container_name;
    return this.store.find('container', id);
  },

  renderTemplate: function(){
    this.render('objects-list');
    this.render('bar/rt-objects', {
      into: 'application',
      outlet: 'bar-rt',
      controller: 'objects',
    });
    this.render('bar/lt-objects', {
      into: 'application',
      outlet: 'bar-lt',
      controller: 'objects',
    });
    this.render('global/breadcrumbs', {
      into: 'application',
      outlet: 'breadcrumbs',
      controller: 'objects',
    });
  }
});
