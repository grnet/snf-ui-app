import DS from 'ember-data';
import Ember from 'ember';

export default DS.RESTSerializer.extend({
  extract: function(store, type, payload) {
    var userId = Ember.keys(payload.uuid_catalog)[0];
    return {
      'id': userId,
      'uuid': userId,
      'email': payload.uuid_catalog[userId]
    }
  }
});
