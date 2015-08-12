import Ember from 'ember';

export default Ember.Controller.extend({
	validationOnProgress: false,
	inputValue: undefined,
	validInput: false,
	closeDialog: false,
  msg: false,

	fwdFeedback: function() {
		var inputValue = this.get('inputValue');
		if(this.get('validInput')) {
			this.send('sendFeedback', inputValue, '');
      this.showMessage();
		}
	}.observes('validInput'),

  showMessage: function(){
    var self = this;
    this.set('msg', true);
    Ember.run.later(function(){
      self.set('closeDialog', true);
      self.set('validInput', false);
    }, 1500);
    Ember.run.later(function(){
      self.set('msg', false);
    }, 2000);

  },

	errorReportMsg: function() {
		var title = this.t('error_report.title');
		var errors = this.t('error_report.errors_label') + this.get('errors');

		var description = this.t('error_report.descr_label') + this.get('inputValue') +'\n';

		return title + errors + description;

	}.property('errors'),

  errorReportExtraData: function() {
    var w = window,
    s = screen,
    d = document,
    n = navigator,
    client = Ember.Object.create({
      browser: {
        appVersion: n.appVersion,
        userAgent: n.userAgent,
        platform: n.platform
      },
      screen: {
        dolorDepth: s.colorDepth,
        pixelDepth: s.pixelDepth,
        contentHeight: w.innerHeight,
        contentWidth: w.innerWidth,
        availWidth: s.availWidth,
        availHeight: s.availHeight
      }
    });
    return JSON.stringify(client);
  }.property('model.@each'),

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
      this.showMessage();
		}
	}
});
