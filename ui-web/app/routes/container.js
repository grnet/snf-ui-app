import Ember from 'ember';
import ResetScrollMixin from '../mixins/reset-scroll';

export default Ember.Route.extend(ResetScrollMixin,{
  renderTemplate: function(){
    this.render('container');
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
