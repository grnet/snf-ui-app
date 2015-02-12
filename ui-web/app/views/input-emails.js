import Ember from 'ember';

/*
 * In order this view to work its controller must have the properties:
 * TBA...
 * Also, must have the actions:
 * TBA...
*/

export default Ember.View.extend({
	templateName: 'input-emails',
	classNames: ['input-emails', 'input-with-valid'],

	errorVisible: false,
	errorMsg: undefined,
	warningVisible: false,
	warningMsg: undefined,

	value: undefined,

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

	didInsertElement: function() {
		var self = this;
		this.$().on('click', '.remove', function() {
			var email = $(this).siblings('.email').text();
			self.get('controller').send('removeUser', email);
		});
	},

	allUsersValid: function() {
		var allUsersValid = this.get('controller').get('usersExtended').every(function(user, index) {
			return user.get('status') === 'success';
		});

		this.get('controller').set('allUsersValid', allUsersValid);
	}.observes('controller.usersExtended.@each.status'),

	eventManager: Ember.Object.create({
		keyUp: function(event, view) {

			if(view.$('input').is(':focus')) {

				var value = view.$('input').val();
				view.set('value', value);

				if(view.get('notEmpty')) {
					value = view.get('value');

					// paste multiple emails seperated by commas
					if(value.indexOf(',') !== -1) {
						var emails = value.split(',');
						view.set('value', '');
						emails.forEach(function(email, index) {
							view.send('handleNewEmail', email);
						});
					}

					/* paste multiple emails seperated by spaces
					 * if the emails are seperated by enter, the input understands
					 * it as space
					*/
					else if(value.indexOf(' ') !== -1) {
						var emails = value.split(' ');
						view.set('value', '');
						emails.forEach(function(email, index) {
							view.send('handleNewEmail', email);
						});
					}

					/* paste multiple emails seperated by tabs
					*  (copy from spreadsheet)
					*/
					else if(value.indexOf('\t') !== -1) {
						var emails = value.split('\t');
						view.set('value', '');
						emails.forEach(function(email, index) {
							view.send('handleNewEmail', email);
						});
					}

					// enter or space
					else if(event.keyCode === 13 || event.keyCode === 32) {
						var email = value;
						view.set('value', '');
						view.send('handleNewEmail', email);
					}
				}
				else {
					// backspace
					if(event.keyCode === 8) {
						var email = view.$('.email:last').text();
						view.get('controller').send('removeUser', email);
					}
				}
			}
		}
	}),

	actions: {

		handleNewEmail: function(email) {
			if(email.length !== 0) {
				var isEmail = is.email(email);
				if(isEmail) {
					this.get('controller').send('addUser', {email: email, status: 'loading'});
				}
				else {
					this.get('controller').send('addUser', {email: email, status: 'error', errorMsg: 'Not valid e-mail'});

				}
			}
		},

		getInputValue: function() {
			var event = $.Event('keyup');
			event.keyCode = 13;
			this.$('input').focus();
			this.$('input').trigger(event);
		}
	}
});
