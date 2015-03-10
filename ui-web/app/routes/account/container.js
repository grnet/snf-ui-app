import Ember from 'ember';
import DS from 'ember-data';


var Promise = Ember.RSVP.Promise;

export default Ember.Route.extend({
  model: function(params) {
    var account = DS.PromiseObject.create({
      promise: this.store.findById('user', params.account)
    });
    this.set('account', account);

    var promise = new Promise(function(resolve, reject) {
      this.get('account').then(function(account) {
        var query = {'account': account.get('id')};
        return this.store.findQuery('container', query).then(resolve, reject);
      }.bind(this)).catch(reject);
    }.bind(this));
    return DS.PromiseArray.create({ promise: promise });
  },

  setupController: function(controller, model) {
    this._super(controller, model);
    controller.set('account', this.get('account'));
  }
});
