import DS from 'ember-data';

export default DS.RESTSerializer.extend({
  extractArray: function(store, type, payload) {
    var project_list = payload;
    project_list.forEach(function(project){
        project.diskspace = project.resources['pithos.diskspace'].member_capacity;
    });
    payload = { projects: project_list};
    return this._super(store, type, payload);
  },
  extractSingle: function(store, type, payload, id) {
    payload = { project: payload};
    return this._super(store, type, payload, id);
  },
  normalizeHash: {
    project: function(hash){
      hash.diskspace = hash.resources['pithos.diskspace'].member_capacity;
      return hash;
    }
  }

});
