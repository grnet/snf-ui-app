import Ember from 'ember';

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

	isEmail: function() {
		var value = this.get('value');
		var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
		return re.test(value);
	}.property('value'),

	didInsertElement: function() {},

	eventManager: Ember.Object.create({
		input: function(event, view) {
			var value = view.$('input').val();
			view.set('value', value);
			if(view.get('notEmpty')) {
				value = view.get('value');
				if(value.indexOf(',') !== -1) {
					view.set('value', value.substring(0, value.indexOf(',')))
					var isEmail = view.get('isEmail');
					if(isEmail) {
						console.log('yes it is email!!!')
					}
					else {
						console.log('not valid email!!!')
					}
				}
			}
			else {

			}

		}
	}),
});
