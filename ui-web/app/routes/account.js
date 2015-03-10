import Ember from 'ember';

export default Ember.Route.extend({
  model: function(){
    return this.store.find('account');
  },

  renderTemplate: function(){
    this._super();
    this.render('bar', {
      into: 'account',
      outlet: 'bar',
      controller: 'account.container.objects',
    });
  }
});
