import Ember from 'ember';

export default Ember.View.extend({
	templateName: 'input-emails',
	classNames: ['input-emails', 'input-with-valid'],

	errorVisible: false,
	errorMsg: undefined,
	warningVisible: false,
	warningMsg: undefined,

	value: undefined,
	usersToBeAdded: [],

	notEmpty: function() {
		var value = this.get('value');
		if(value) {
			value = value.trim();
		}
		else {
			value = '';
		}
		if(value === '') {
			this.set('value', undefined);
			return false;
		}
		else {
			this.set('value', value);
			return true;
		}
	}.property('value'),


	didInsertElement: function() {},

	updateUser: function() {
		var updatedUser = this.get('controller').get('userData');
		var email = updatedUser.get('email');
		var uuid = updatedUser.get('uuid');
		var status = updatedUser.get('status');
		var errorMsg = updatedUser.get('errorMsg');
		this.send('applyUpdateUser', email, uuid, status, errorMsg);
	}.observes('controller.userData'),

	eventManager: Ember.Object.create({
		input: function(event, view) {
			var value = view.$('input').val();
			view.set('value', value);

			if(view.get('notEmpty')) {
				value = view.get('value');

				if(value.indexOf(',') !== -1) {
					var emails = value.split(',');
					view.set('value', '')
					emails.forEach(function(email, index) {
						email = email.trim();
						if(email.length !== 0) {
							var isEmail = is.email(email)
							view.send('addUser', email, 'loading', undefined)
							if(isEmail) {
								view.get('controller').send('findUser', email)
							}
							else {
								view.send('applyUpdateUser', email, undefined, 'error', 'Not valid e-mail')
							}
						}
					});
				}
			}
		}
	}),
	actions: {
		applyUpdateUser: function(email, uuid, status, errorMsg) {
			this.get('usersToBeAdded').forEach(function(user) {
				if (email === user.email) {
					if(uuid) {
						user.set('uuid', uuid);
					}
					if(status) {
						user.set('status', status);
					}
					if(errorMsg) {
						user.set('errorMsg', errorMsg);
					}
				}
			});
		},

		addUser: function(email, status, uuid) {
			var user = this.get('usersToBeAdded').filterBy('email', email);

			if(user.length === 0) {
				this.get('usersToBeAdded').pushObject(Ember.Object.create({email: email, status: 'loading'}));
			}
			else {
				// already there....
				// I won't show it at all....
			}
		}
	}
});
