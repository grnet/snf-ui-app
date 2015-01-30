import Ember from 'ember';

export default Ember.View.extend({
	templateName: 'input-emails',
	classNames: ['input-emails', 'input-with-valid'],

	errorVisible: false,
	errorMsg: undefined,
	warningVisible: false,
	warningMsg: undefined,

	value: undefined,
	usersToBeAdded: [{email: 'user@synnefo.org', curState: 'loading', uuid: 'should be placed here?'}],

	notEmpty: function() {
		var value = this.get('value');
		console.log('>>', value)
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
		console.log('***',email)
		// var value = this.get('value');
		// to be checked!!! I added greek chars but I should either to permit all
		// unicode chars or not to check at all if the value is an email
		var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Zα-ωΑ-Ω\-0-9]+\.)+[a-zA-Z]{2,}))$/;
		return re.test(email);
	}.property(),

	tileHTML: function(email) {
		return 
	},

	didInsertElement: function() {},

	eventManager: Ember.Object.create({
		input: function(event, view) {
			var value = view.$('input').val();
			view.set('value', value);

			if(view.get('notEmpty')) {
				value = view.get('value');

				if(value.indexOf(',') !== -1) {
					var emails = value.split(',');
					emails.forEach(function(email, index) {
						email = email.trim();
						if(email.length === 0) {
							emails.splice(index, 1);
						}
					});

					// var isEmail = view.get('isEmail');

					// if(isEmail) {
					// 	console.log('yes it is email!!!')
					// }
					// else {
					// 	console.log('not valid email!!!')
					// }
					view.send('makeTile')
				}
			}
			else {
				// empty
			}

		}
	}),
	actions: {
		makeTile: function() {

		}
	}
});
