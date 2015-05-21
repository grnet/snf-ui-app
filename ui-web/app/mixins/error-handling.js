import Ember from 'ember';

export default Ember.Mixin.create({
	init: function() {
		var self = this;

		// Catches js errors
		Ember.onerror = function(error) {
			console.error('%c[Ember.onerror] Error Report\n', error.message, error.stack);
			self.send('showActionFail', error);
		};
	},

	actions: {
		/*
		 * when the server returns error and we want full page error msg
		 * we override the action: error
		 */
		error: function(error, transition) {
			console.log('error', error.stack || error);
			switch(error.status) {
				case 404:
					this.render('errors/404', {
						//  we use "into" to keep the header with the nav
						// into: 'application', navigation doesn't work properly
						model: error
					});
					break;

				default:
					this.render('errors/503', {
						model: error
					});
					break;
			}
		},
		showActionFail: function(error, controller) {
			if(error.stack) {
				var error = Ember.Object.create({
					message: error.message,
					stack: error.stack
				});
			}
			this.refresh();
			this.render('overlays/error', {
				into: 'application',
				outlet: 'errorDialogs',
				controller: controller,
				model: error,
				view: 'dialog',
			});
		}
	}
});
