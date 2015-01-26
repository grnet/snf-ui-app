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

	encodedInput: undefined,

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
		}
	}),

	actions: {
		toLowerCase: function() {
		var self = this;
		var value = this.$('input').val();
		var valueLower = value.toLowerCase();
		if(value !== valueLower) {
			this.set('warningMsg', 'Capital letters are not allowed')
			setTimeout(function() {
				self.$('input').val(valueLower);
				self.set('warningVisible', true);
			}, 300);
		}
		},
		getInput: function() {},
		encode: function() {},

	}

});
