import Ember from 'ember';

export default Ember.Route.extend({

	renderTemplate: function() {
		/*
		* if you define an inner outlet you don't
		* define and the main template, it will crash
		*/
		this.render("application");
		this.render('total-quotas', {
			into: 'application',
			outlet: 'total-quotas',
		});
	},

  setupController: function(controller, model) {
    controller.set('model', model);
    this.store.find('project', controller.settings.get('uuid')).then(function(p) {
      controller.set('systemProject', p);
    });
  },



	actions: {
		/*
		 * when the server returns error and we want to handle it
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
				// controller: controller,
				model: error,
				view: 'dialog',
			});
		},

		/*
		 * when a user clicks a button that shows a modal, triggers the action showModal
		 * in the template:
		 * <a  {{action 'showDialog' <dialogType> <controller> <model> <actionName>}}></a>
		 * if there is no specific action on click there is no need to add actionName
		 * dialogType is the name of the template in the folder overlays
		 */

		showDialog: function(dialogType, controller, model, actionName) {
			var outlet = undefined;
			if(actionName) {
				/* actionToPerform is used in the dialog template:
				 * {{action actionToPerform}}
				 * actionToPerform is the name of the action
				 * that there is in the controller/route
				 */
				controller.set('actionToPerform', actionName);
			}
			if(dialogType === 'feedback') {
				outlet = 'feedback'
			}
			else {
				outlet = 'dialogs'
			}
			this.render('overlays/'+dialogType, {
				into: 'application',
				outlet: outlet,
				controller: controller,
				model: model,
				view: 'dialog',
			});
		},
		// removeDialog is used for every type of dialog that has rendered
		removeDialog: function(dialogType) {
			// Disconnects a view that has been rendered into an outlet.
			var outlet = undefined;
			if(dialogType) {
				if(dialogType === 'feedback') {
					outlet = 'feedback';
				}
				else if(dialogType === 'error') {
					outlet = 'errorDialogs';
				}
				else {
					outlet = 'dialogs'
				}
				this.disconnectOutlet({
					outlet: outlet,
					parentView: 'application'
				});
			}
			else {
				// if dialogType is undefined disconnect all the dialogs
				this.disconnectOutlet({
					outlet: 'feedback',
					parentView: 'application'
				});

				this.disconnectOutlet({
					outlet: 'errorDialogs',
					parentView: 'application'
				});

				this.disconnectOutlet({
					outlet: 'dialogs',
					parentView: 'application'
				});

			}
		},
		willTransition: function(transition) {
			this.send('removeDialog');
		},
		sendFeedback: function(msg, data) {
			var self = this;
			var url = this.get('settings').get('account_url')+ '/feedback/';
			var headers = {
				'X-Auth-Token': this.get('settings').get('token'),
	      'X-Requested-With': 'XMLHttpRequest',
	      'Content-Type': 'application/json'
	    };
	    var data = {
				feedback_msg: msg,
				feedback_data: data
	    };
	    var onSuccess = function(data, textStatus, jqXHR) {
				// tba
	    };

	    var onFail = function(jqXHR, textStatus, error) {
				console.log('feedback error:', textStatus, jqXHR)
				self.send('showActionFail', jqXHR);
	    }

	    $.ajax({
				url: url,
				type: 'POST',
				headers: headers,
				dataType: 'text',
				data: data
	    }).then(onSuccess, onFail);
		}
	}
});
