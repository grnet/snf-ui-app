import DS from 'ember-data';

export default DS.RESTAdapter.extend({
	headers: function(){
			return {'X-Auth-Token': this.get('settings').get('token'),
							'X-Requested-With': 'XMLHttpRequest',
							'Content-Type': 'application/json'};
	}.property(),

	host: function(){
		return this.get('settings').get('account_url');
	}.property(),

	ajaxSuccess: function(jqXHR, jsonPayload) {
		var quotas_url = this.get('host') + '/quotas';
		var headers = this.get('headers');

		return new Ember.RSVP.Promise(function(resolve, reject) {
			$.ajax({
				url: quotas_url,
				headers: headers
			}).then(function(data) {
				var quotas_data = { quotas: data };
				Ember.run(null, resolve, _.extend(jsonPayload, quotas_data));
				}, function(jqXHR, textStatus, errorThrown) {
					console.log('%cfail', "color: blue", jqXHR, textStatus, errorThrown);
					Ember.run(null, reject, "error");
				});
		});
	}
});