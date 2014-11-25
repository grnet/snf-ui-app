import Ember from 'ember';

export default Ember.Controller.extend({
	validationOnProgress: false,
	inputValue: undefined,
	closeDialog: false,
	fwdFeedback: function() {
		var inputValue = this.get('inputValue');
		if(inputValue) {
			this.send('sendFeedback', inputValue, '');
			this.set('closeDialog', true);
		}
	}.observes('inputValue'),
	actions: {
		validateTextArea: function() {
			this.set('closeDialog', false);
			this.set('validationOnProgress', true);
		}
	}
});
