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

	// move it
	isEmail: function(email) {
		// var value = this.get('value');
		// to be checked!!! I added greek chars but I should either to permit all
		// unicode chars or not to check at all if the value is an email
		var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Zα-ωΑ-Ω\-0-9]+\.)+[a-zA-Z]{2,}))$/;
		return re.test(email);
	}.property(),


	didInsertElement: function() {},

	updateUser: function() {
		var updatedUser = this.get('controller').get('userData');
		var email = updatedUser.get('email');
		this.get('usersToBeAdded').forEach(function(item) {

		if (email === item.email) {
			item.set('status', updatedUser.get('status'));
		}
		});
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
							var isEmail = true;
							view.send('addUser', email, 'loading', undefined)
							if(isEmail) {
								view.get('controller').send('findUser', email)
							}
							else {
							// not valid email...
							}
						}
					});
				}
			}
		}
	}),
	actions: {
		addUser: function(email, status, uuid) {
			var user = this.get('usersToBeAdded').filterBy('email', email);

			if(user.length === 0) {
				this.get('usersToBeAdded').pushObject(Ember.Object.create({email: email, status: 'loading'}));
			}
			else {
				// already there....
				// I won't show it at all....
				console.log('[addUser] already in the input')
			}
		}
	}
});
