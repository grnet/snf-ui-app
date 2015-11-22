import DS from 'ember-data';

export default DS.RESTSerializer.extend({
  extractArray: function(store, type, payload) {
    var quotas = payload.quotas;

    delete payload.quotas;

    var project_list = payload;

    project_list.forEach(function(project) {
      var id = project['id'];
      var diskspace_quotas = quotas[id]['pithos.diskspace'];

      project['diskspace_user_usage'] = diskspace_quotas['usage'];
      project['diskspace_project_usage'] = diskspace_quotas['project_usage'];
      project['diskspace_user_limit'] = diskspace_quotas['limit'];
      project['diskspace_project_limit'] = diskspace_quotas['project_limit'];
      delete project.resources;
    });

    payload = { projects: project_list};

    return this._super(store, type, payload);
  },
  extractSingle: function(store, type, payload, id) {
    var quotas = payload.quotas;
    var id = payload['id'];
    var diskspace_quotas = quotas[id]['pithos.diskspace'];

    delete payload.resources;
    delete payload.quotas;
    payload['diskspace_user_usage'] = diskspace_quotas['usage'];
    payload['diskspace_project_usage'] = diskspace_quotas['project_usage'];
    payload['diskspace_user_limit'] = diskspace_quotas['limit'];
    payload['diskspace_project_limit'] = diskspace_quotas['project_limit'];
    payload = { project: payload};
    return this._super(store, type, payload, id);
  }
});
