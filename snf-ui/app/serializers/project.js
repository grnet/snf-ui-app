import DS from 'ember-data';

export default DS.RESTSerializer.extend({
  normalizeAttributes: function(type, payload) {
    var quotas = payload.quotas;
    var id = payload['id'];
    var is_member = true;
    var diskspace_quotas;
    if (quotas[id] === undefined) {
      diskspace_quotas = {
        'usage': 0,
        'project_usage': 0,
        'limit': 0,
        'project_limit': 0
      }
      is_member = false;
    } else {
      diskspace_quotas = quotas[id]['pithos.diskspace'];
    }

    delete payload.resources;
    delete payload.quotas;

    payload['diskspace_user_usage'] = diskspace_quotas['usage'];
    payload['diskspace_project_usage'] = diskspace_quotas['project_usage'];
    payload['diskspace_user_limit'] = diskspace_quotas['limit'];
    payload['diskspace_project_limit'] = diskspace_quotas['project_limit'];
    payload['is_member'] = is_member;
    return payload;
  },

  extractArray: function(store, type, payload) {
    payload.forEach(function(p) { p.quotas = payload.quotas});
    delete payload.quotas;
    payload = { projects: payload };
    return this._super(store, type, payload);
  },

  extractSingle: function(store, type, payload, id, requestType) {
    return this._super(store, type, {project: payload}, id, requestType);
  }
});
