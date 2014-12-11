import Ember from 'ember';
/*
* For now this view is used for 3 things:
*  - create container
*  - create direcory
*  - rename object
* The above actions set or modify the ID of the record.
* The view runs some validations for the input value but the controller
* of the corresponding action checks if there is already another object
* with the new ID.
*
* Note: each of the above actions are handled by a different controller.
*/
export default Ember.View.extend({
	classNames: ['input-with-valid'],
	classNameBindings: ['cls'], // cls is provited by parent the template

	templateName: 'input-with-validation',

	inputValue: function() {
		var value = this.$('input').val();
		if(value) {
			value = value.trim();
		}
		else {
			value = '';
		}
		return value;
	}.property('controller.validationOnProgress'),

	errorVisible: false,

	notEmpty: function() {
		var value = this.get('inputValue');
		return value ? true : false;
	}.property('inputValue'),

	noSlash: function() {
		return this.get('inputValue').indexOf('/') === -1;
	}.property('inputValue'),

	notTooLarge: function() {
		var charLimit = this.get('controller').get('nameMaxLength');
		return this.get('inputValue').length <= charLimit;
	}.property('inputValue'),

	/*
	* Each controller must have these properties:
	* - validationOnProgress
	* - isUnique
	* - actionToExec
	* - newID
	* - newName
	* Also, should have checkUnique function
	*
	* If the checks of the view result that the input is in a valid form,
	* the controller must check if the ID is unique
	*/
	validateInput: function() {
		var toValidate = this.get('controller').get('validationOnProgress');
		if(toValidate) {
			var action = this.get('controller').get('actionToExec');
			var validForm = false;
			var notEmpty, noSlash, notTooLarge;

			this.set('errorVisible', false);
			if(action === 'createContainer') {
				notEmpty = this.get('notEmpty');
				noSlash = this.get('noSlash');
				notTooLarge = this.get('notTooLarge');
				validForm = notEmpty && noSlash && notTooLarge;
				if(validForm) {
					this.get('controller').set('newName', this.get('inputValue'));
				}
			}
			else if(action === 'createDir' || action === 'renameObject') {
				notEmpty = this.get('notEmpty');
				notTooLarge = this.get('notTooLarge');
				validForm = notEmpty && notTooLarge;
				if(validForm) {
					this.get('controller').set('newName', this.get('inputValue'));
				}
			}
			if(!validForm) {
				this.send('showError');
			}
		}

	}.observes('controller.validationOnProgress'),

	completeValidations: function() {
		var isUnique = this.get('controller').get('isUnique');
		if(isUnique !== undefined) {
			if(!isUnique) {
				this.send('showError', 'notUnique');
			}
			this.get('controller').set('validInput', isUnique);
			this.get('controller').set('validationOnProgress', false);
		}
	}.observes('controller.isUnique'),

	reset: function() {
		if(this.get('controller').get('resetInput')) {
			this.set('errorVisible', false);
			this.$('input').val();
			this.set('errorMsg', '');
			this.get('controller').set('resetInput', false);
		}
	}.observes('controller.resetInput'),

	actions: {
		showError: function(notUnique) {
			var action = this.get('controller').get('actionToExec');
			this.set('errorVisible', false);
			if(notUnique) {
				this.set('errorMsg', 'Already exists');
			}
			else {
				var notEmpty = this.get('notEmpty');
				var notTooLarge = this.get('notTooLarge');

				if(!notEmpty) {
					this.set('errorMsg', 'Empty input');
				}
				else if(!notTooLarge) {
					this.set('errorMsg', 'Too large. Max: '+this.get('controller').get('nameMaxLength')+ ' chars');
				}
				else if(action === 'createContainer') {
					var noSlash = this.get('noSlash');
					if(!noSlash) {
						this.set('errorMsg', '"/" is not allowed');
					}
				}
			}
			this.set('errorVisible', true);
			this.get('controller').set('validationOnProgress', false);
		},
	},
});
