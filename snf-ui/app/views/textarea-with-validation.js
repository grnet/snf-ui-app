import Ember from 'ember';

// For now it is used for feedback
export default Ember.View.extend({
	classNames: ['textarea-with-valid'],
	templateName: 'textarea-with-validation',
	errorMsg: undefined,
	errorVisible: undefined,
	value: undefined,
	didInsertElement: function() {
		var self = this;
		this.$('textarea').keypress(function() {
			self.set('errorVisible', false);
		});
	    this._super();
	},

	eventManager: Ember.Object.create({
		keyUp: function(event, view) {
			// when esc is pressed the parent dialog should close
			var escKey = 27;
			event.stopPropagation();
			if(event.keyCode !== escKey) {
				if(view.$('textarea').is(':focus')) {
					var value = view.$('textarea').val();
					view.set('value', value);
					view.get('controller').set('inputValue', value);
				}
			}
			else {
				$('body .close-reveal-modal').trigger('click');
			}
		}
	}),

	validateInput: function(actionToExec) {
		var validationOnProgress = this.get('controller').get('validationOnProgress')
		if(validationOnProgress) {
			var value = this.get('value');
			if(value) {
				value = value.trim();
			}
			if(value) {
				this.set('errorVisible', false);
				this.get('controller').set('validInput', true);
				this.get('controller').set('validationOnProgress', false);
			}
			else {
				this.get('controller').set('validInput', false);
				this.send('showError', 'Empty input');
			}
		}
	}.observes('controller.validationOnProgress').on('init'),

	actions: {
		showError: function(errorMsg) {
			this.set('errorMsg', errorMsg);
			this.set('errorVisible', true);
			this.get('controller').set('inputValue', undefined);
			this.get('controller').set('validationOnProgress', false);
		}
	}
});
