import Ember from 'ember';

export default Ember.Controller.extend({
	validationOnProgress: false,
	inputValue: undefined,
	validInput: false,
	closeDialog: false,

	fwdFeedback: function() {
		var inputValue = this.get('inputValue');
		if(this.get('validInput')) {
			this.send('sendFeedback', inputValue, '');
			this.set('closeDialog', true);
			this.set('validInput', false);
		}
	}.observes('validInput'),

	errorReportMsg: function() {
		var title = this.t('error_report.title');
		var errors = this.t('error_report.errors_label') + this.get('errors');

		var description = this.t('error_report.descr_label') + this.get('inputValue');

		return title + errors + description;

	}.property('errors'),

	errorReportExtraData: function() {

		return 'No system/browser data for now.';
	}.property(),

	// parsing errors data if there are any
	errors: function() {
		var errors = this.get('model');
		var str = '';
		if(errors.get('length') > 0) {
			console.log('errors!', errors.get('length'));
			let delimiter = this.t('error_report.delimiter');
			errors.forEach(function(error) {
				str += error.get('string') + '\n' + delimiter + '\n';
			});
		}
		return str;
	}.property('model.@each'),

	actions: {
		validateAndSend: function() {
			this.set('closeDialog', false);
			this.set('validationOnProgress', true);
		},
		fwdErrorFeedback: function() {
			var extraData = this.get('errorReportExtraData');
			var msg = this.get('errorReportMsg');
			var data = this.get('errorReportExtraData');
			this.send('sendFeedback', msg, data);
		}
	}
});
