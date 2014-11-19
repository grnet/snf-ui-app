import Ember from 'ember';

export default Ember.Route.extend({
	actions: {
		/* when the server returns error and we want to handle it
		 * we override the action: error
		 */
		error: function(error, transition) {
			console.log('error', error)
			switch(error.status) {
				case 404:
					this.render('errors/404', {
						//  we use "into" to keep the header with the nav
						// into: 'application', navigation doesn't work properly
						model: error
					});
					break;
				// should check how and what will handle 503 errors
				default:
					this.render('errors/503', {
						model: error
					});
					break;
			}
		},
		/* when a user clicks a button that shows a modal, triggers the action showModal
		 * in the template:
		 * <a  {{action 'showModal' <dialogType> <controller> <model> <actionName>}}></a>
		 * if there is no specific action on click there is no need to add actionName
		 * dialogType is the name of the template in the folder dialogs
		 */
		showDialog: function(dialogType, controller, model, actionName) {
			if(actionName) {
				/* actionToPerform is used in the dialog template:
				 * {{action actionToPerform}}
				 * actionToPerform is the name of the action
				 * that there is in the controller/route
				 */
				controller.set('actionToPerform', actionName);
			}

			this.render('dialogs/'+dialogType, {
				into: 'application',
				outlet: 'dialogs',
				controller: controller,
				model: model,
				view: 'dialog',
			});
		},
		removeDialog: function() {
			// Disconnects a view that has been rendered into an outlet.
			this.disconnectOutlet({
				outlet: 'dialogs',
				parentView: 'application'
			});
		},
		willTransition: function(transition) {
			this.send('removeDialog');
		}
	}
});
