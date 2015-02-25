import Ember from 'ember';

export default Ember.Route.extend({
  renderTemplate: function(){
    this.render('container');
    this.render('bar', {
      into: 'container',
      outlet: 'bar',
      controller: 'objects',
    });
  }
});
