import DS from 'ember-data';
import Ember from 'ember';

export default DS.RESTSerializer.extend({
  extract: function(store, type, payload) {
    if (_.isEmpty(payload.uuid_catalog) && !_.isEmpty(payload.displayname_catalog)) {
      var userEmail = Ember.keys(payload.displayname_catalog)[0];
      console.log(userEmail)
      return {
        'id': payload.displayname_catalog[userEmail],
        'uuid': payload.displayname_catalog[userEmail],
        'email': userEmail
      }
    }
    else if (!_.isEmpty(payload.uuid_catalog) && _.isEmpty(payload.displayname_catalog)) {
      var userId = Ember.keys(payload.uuid_catalog)[0];
      return {
        'id': userId,
        'uuid': userId,
        'email': payload.uuid_catalog[userId]
      }
    }
    else {
      throw new Error('Not found');
    }
  }
});
