import StorageAdapter from 'ui-web/snf/adapters/storage';

export default StorageAdapter.extend({

  ajaxSuccess: function(jqXHR, jsonPayload) {

    // get all headers as a string
    var headers = jqXHR.getAllResponseHeaders();

    // put all headers that start with X-Account-Group in an array
    var group_headers_arr = headers.match(/\bX-Account-Group-\w[^\b]*?\b/g);

    var groups = [];

    if (group_headers_arr) {
      group_headers_arr.forEach(function(h){
        var obj = {};
        obj.id = h.replace('X-Account-Group-', '');
        obj.name = h.replace('X-Account-Group-', '');
        obj.uuids = jqXHR.getResponseHeader(h);
        if (obj.uuids === '~') {return;}
        if (obj.uuids) {
          obj.users = obj.uuids.split(',');
        } else {
          obj.users = [];
        }

        groups.push(obj);
      });
      jsonPayload.groups = groups;
    }

    return jsonPayload;
  },

  updateRecord: function(store, type, record) {
    var self = this;
    var headers = this.get('headers');
    var header = 'X-Account-Group-'+record.get('name');
    headers['Accept'] = 'text/plain';
    return record.get('users').then(function(users){
      //console.log('users', users);
      headers[header] = users.map(function(user){
        console.log('user.id', user.id);
        return user.id;
      }).join(',');
      return self.ajax(self.buildURL(type.typeKey)+'?update=', 'POST');
    });

  },

  createRecord: function(store, type, record){
    return this.updateRecord(store, type, record);
  },

  deleteRecord: function(store, type, record) {
    var headers = this.get('headers');
    var header = 'X-Account-Group-'+record.get('name');
    headers['Accept'] = 'text/plain';
    headers[header] = '~';
    return this.ajax(this.buildURL(type.typeKey)+'?update=', 'POST');
 
  }

});

