import Ember from 'ember';

// For now it is used for feedback
export default Ember.View.extend({
	classNames: ['textarea-with-valid'],
	templateName: 'textarea-with-validation',
	errorMsg: undefined,
	errorVisible: undefined,
	didInsertElement: function() {
		var self = this;
		this.$('textarea').keypress(function() {
			self.set('errorVisible', false);
		});
    this._super();
	},

	validateInput: function(actionToExec) {
		var validationOnProgress = this.get('controller').get('validationOnProgress')
		if(validationOnProgress) {
			var value = this.$('textarea').val();
			if(value) {
				value = value.trim();
			}
			if(value) {
				this.set('errorVisible', false);
				this.get('controller').set('inputValue', value);
				this.get('controller').set('validationOnProgress', false);
			}
			else {
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
