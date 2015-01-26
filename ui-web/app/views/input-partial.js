import Ember from 'ember';
/*
* This view is meant to used in forms that will have more then one
* input fields, textareas etc.
* For now, it is used to create group.
* Its main difference from the view.inputSingle is that most of the
* validations and actions are triggered on focusOut or input events.
*/

export default Ember.View.extend({
	classNames: ['input-with-valid', 'input-partial'],
	classNameBindings: ['cls'], // cls is provited by parent the template

	templateName: 'input-partial',
	errorVisible: false,
	errorMsg: undefined,
	warningVisible: false,
	warningMsg: undefined,

	value: undefined,
	encodedInput: undefined,

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

	eventManager: Ember.Object.create({
		input: function(event, view) {
			var event = event['type'];
			var actions = view.get(event);
			var actions = actions.split(' ');

			actions.forEach(function(action) {
				view.send(action)
			});
		},

		focusOut: function(event, view) {
			var event = event['type'];
			var actions = view.get(event);
			var actions = actions.split(' ');
			view.set('warningVisible', false);
			if(this.get('notEmpty')) {
				console.log('NOT EMPTY')
			}
			else {
				view.send('showInfo', 'Empty input', true)
			}
		}
	}),

	actions: {
		showInfo: function(msg, isError) {
			if(isError) {
				this.set('errorMsg', msg);
				this.set('errorVisible', true);
			}
			else {
				this.set('warningMsg', msg);
				this.set('warningVisible', true);
			}
		},

		toLowerCase: function() {
			var self = this;
			var value = this.$('input').val();
			var valueLower = value.toLowerCase();
			if(value !== valueLower) {
				setTimeout(function() {
					self.$('input').val(valueLower);
					self.send('showInfo','Capital letters are not allowed')
				}, 300);
			}
		},


	}

});
