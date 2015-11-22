import DS from 'ember-data';

export default DS.RESTSerializer.extend({
  extractArray: function(store, type, payload) {
    var account = payload.account;
    delete payload.account;
    payload.forEach(function(el) {
      el.id = account + '/'+ el.name;
    });
    payload = { containers: payload};
    return this._super(store, type, payload);
  },
  extractSingle: function(store, type, payload, id) {
    var account, parts;

   if (id.match(/\//)) {
      parts = id.split("/", 2);
      name = parts[1];
      account = parts[0];
    }
    var container = { 
      id: id,
      name: name,
    };
    payload = { 
      container: container, 
    };
    return this._super(store, type, payload, id);
  },
  normalizeHash: {
    containers: function(hash) {
      hash.project = hash.x_container_policy && hash.x_container_policy.project;
      hash.versioning = hash.x_container_policy && hash.x_container_policy.versioning;
      return hash;
    }
  },
});
