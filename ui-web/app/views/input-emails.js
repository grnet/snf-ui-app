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
	reset: function() {
		if(this.get('controller').get('resetInputs')) {
			this.set('value', undefined);
			this.get('controller').set('resetInputs', false);
			this.get('controller').set('resetedInputs', (this.get('controller').get('resetedInputs') + 1));
		}
	}.observes('controller.resetInputs'),

	cleanInput: function() {
		var value = this.get('value');
		if(value) {
			if(value.length >0) {
				this.get('controller').set('cleanUserInput', false);
			}
		}
		else {
			this.get('controller').set('cleanUserInput', true);
		}
	}.observes('value'),

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
							email = email.trim();
							view.send('handleNewEmail', email);
						});
					}

					/*
					 * paste multiple emails seperated by spaces
					 * if the emails are seperated by enter, the input understands
					 * it as space
					*/
					else if(value.indexOf(' ') !== -1) {
						var emails = value.split(' ');
						view.set('value', '');
						emails.forEach(function(email, index) {
							email = email.trim();
							view.send('handleNewEmail', email);
						});
					}

					/*
					 * paste multiple emails seperated by tabs
					 * (copy from spreadsheet)
					*/
					else if(value.indexOf('\t') !== -1) {
						var emails = value.split('\t');
						view.set('value', '');
						emails.forEach(function(email, index) {
							view.send('handleNewEmail', email);
							email = email.trim();
						});
					}

					// enter or space
					else if(event.keyCode === 13 || event.keyCode === 32) {
						var email = value;
						view.set('value', '');
						view.send('handleNewEmail', email);
					}
				}
			}
		},
		keyDown: function(event, view) {
			if(view.$('input').is(':focus')){
				if(event.keyCode === 8 && view.$('input').val().length === 0) {
					// backspace and empty input
					var email = view.$('.email:last').text();
					view.get('controller').send('removeUser', email);
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
