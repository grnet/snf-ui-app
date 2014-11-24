import DS from 'ember-data';

export default DS.RESTSerializer.extend({
  extractArray: function(store, type, payload) {
    var groups = payload.groups;
    payload = { groups: groups};
    console.log(payload);
    return this._super(store, type, payload);
  },
});
