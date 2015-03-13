import Ember from 'ember';
import ResetScrollMixin from '../mixins/reset-scroll';

export default Ember.Route.extend(ResetScrollMixin,{
  renderTemplate: function(){
    this.render('container');
    this.render('bar', {
      into: 'container',
      outlet: 'bar',
      controller: 'objects',
    });
  }
});
