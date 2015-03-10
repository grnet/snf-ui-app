import Ember from 'ember';

export default Ember.ArrayController.extend({
  needs: ['account'],
  accounts: Ember.computed.alias('controllers.account.model')
});
