import Ember from 'ember';

export default Ember.Route.extend({
	actions: {
		// when a user clicks a button that shows a modal, triggers the action showModal
		// in the template:
		// <a  {{action 'showModal' <dialogType> <controller> <model> <actionName>}}></a>
		// if there is no specific action on click there is no need to add actionName
		// dialogType is the name of the template in the folder dialogs
		showDialog: function(dialogType, controller, model, actionName) {
			// actionToPerform is used in the dialog template:
			// {{action actionToPerform}}
			// actionToPerform is the name of the action
			// that there is in the controller/route
			if(actionName) {
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
