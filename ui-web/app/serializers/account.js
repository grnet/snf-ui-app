import DS from 'ember-data';

export default DS.RESTSerializer.extend({
  extract: function(store, type, payload) {
    if (payload) {
      var entries = _.select(payload.split("\n"));
      return entries.map(function(account) {
        return {
          id: account,
          uuid: account,
          user: account
        };
      });
    }
    return [];
  }
});
