import DS from 'ember-data';

export default DS.RESTSerializer.extend({
  extractArray: function(store, type, payload) {
    var project_list = payload;
    payload = { projects: project_list};
    return this._super(store, type, payload);
  },
  extractSingle: function(store, type, payload, id) {
    console.log(payload, 'payload');
    payload = { project: payload};
    return this._super(store, type, payload, id);
  }
});
