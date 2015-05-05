import StorageAdapter from 'ui-web/snf/adapters/storage';

export default StorageAdapter.extend({

	ajaxSuccess: function(jqXHR, jsonPayload) {
		// get all headers as a string
		var headersStr = jqXHR.getAllResponseHeaders();
		var headers = headersStr.split('\n');

		// removes the colon and the uuids of the members of each group
		var re = (/X-Account-Group-\S*(?=:)/g);

		var groupHeader, groupName, groups=[];

		if(headersStr.indexOf('X-Account-Group-') > -1) {
			headers.forEach(function(h) {
				groupHeader = h.match(re);

				if(groupHeader) {
					var group = {};

					group.id = decodeURIComponent(groupHeader[0].replace('X-Account-Group-', '')).toLowerCase();
					group.name = group.id;
					var uuids = jqXHR.getResponseHeader(groupHeader[0]);

					if(uuids === '~'){
						return ;
					}

					if(uuids) {
						group.users = uuids.split(',');
					}
					else {
						group.users = [];
					}

					groups.push(group);
				}
			});

			jsonPayload.groups = groups;
		}

		return jsonPayload;
	},

	updateRecord: function(store, type, snapshot) {
		var self = this;
		var headers = this.get('headers');
		var header = 'X-Account-Group-'+encodeURIComponent(snapshot.attr('name'));
		var users = snapshot.hasMany('users');
		headers['Accept'] = 'text/plain';
		headers[header] = users.getEach('id').join(',');

		return self.ajax(self.buildURL(type.typeKey)+'?update=', 'POST');
	},

	createRecord: function(store, type, snapshot){
		return this.updateRecord(store, type, snapshot);
	},

	deleteRecord: function(store, type, snapshot) {
		var headers = this.get('headers');
		var header = 'X-Account-Group-' + encodeURIComponent(snapshot.attr('name'));
		headers['Accept'] = 'text/plain';
		headers[header] = '~';
		return this.ajax(this.buildURL(type.typeKey)+'?update=', 'POST');
	}
});

