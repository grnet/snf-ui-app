import Ember from 'ember';

export default Ember.Route.extend({
	actions: {
		// when a user clicks a button that shows a modal, triggers the action showModal
		// in the template:
		// <a  {{action 'showModal' <actionName> <controller>}}></a>
		showModal: function(actionName, controller) {
			// actionToPerform is used in the dialog template:
			// {{action actionToPerform}}
			// actionToPerform is the name of the action
			// that there is in the controller/route
			controller.set('actionToPerform', actionName);
			this.render('dialog', {
				into: 'application',
				outlet: 'dialogs',
				controller: controller,
			});
		},
		removeModal: function() {
			// Disconnects a view that has been rendered into an outlet.
			this.disconnectOutlet({
        outlet: 'dialogs',
        parentView: 'application'
      });
		}
	}
});
