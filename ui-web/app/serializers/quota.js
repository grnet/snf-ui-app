import DS from 'ember-data';

export default DS.RESTSerializer.extend({
  extractArray: function(store, type, payload) {
    var proj_array = [];

    for(var proj_id in payload) {
        var data_per_proj = {};
        var new_key = '';
        data_per_proj = payload[proj_id];
        for(var service in data_per_proj) {
            for(var key in data_per_proj[service]){ // key === usage, limit etc...
                    new_key = service.replace(/\./g, '_') + '_' + key;
                    data_per_proj[new_key] = data_per_proj[service][key];
            }
            delete data_per_proj[service];
        }
        data_per_proj['id'] = proj_id;
        proj_array.push(data_per_proj);
    }

    payload = { quotas: proj_array};
    console.log('[serializer quotas]', payload);
    return this._super(store, type, payload);
  }
});
