import Ember from 'ember';

export default Ember.Route.extend({
  beforeModel: function(transition) {
    var params, account;
    params = transition.params['account.container.objects_redirect'];
    account = this.paramsFor('account.container').account;
    this.transitionTo('account.container.objects', params.container_name, '');
  }
});
