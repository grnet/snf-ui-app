import Ember from 'ember';

export default Ember.Mixin.create({
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
			console.log('update', error);
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
