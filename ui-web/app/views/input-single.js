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
	classNames: ['input-with-valid', 'js-input-single'],
	classNameBindings: ['cls'], // cls is provided by parent the template

	templateName: 'input-single',

	oldValue: undefined,
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

	notTooLargeName: function() {
		var charLimit = this.get('controller').get('nameMaxLength');
		return this.get('inputValue').length <= charLimit;
	}.property('inputValue'),

	notTooLargePath: function() {
		var charLimit = this.get('controller').get('nameMaxLength');
		var newPath = this.get('controller').get('current_path') + this.get('inputValue');
		return (newPath.length + 1) <= charLimit;
	}.property('inputValue'),

	isModified: function() {
		var oldValue = this.get('oldValue');
		if(oldValue && oldValue === this.get('inputValue')) {
			return false;
		}
		return true;
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
			var notEmpty, noSlash, notTooLargeName, notTooLargePath;
			var isModified = this.get('isModified');
			this.set('errorVisible', false);
			if(action === 'createContainer') {
				notEmpty = this.get('notEmpty');
				noSlash = this.get('noSlash');
				notTooLargeName = this.get('notTooLargeName');
				validForm = notEmpty && noSlash && notTooLargeName;

				if(validForm) {
					this.get('controller').set('newName', this.get('inputValue'));
				}
			}
			else if(action === 'createDir' || action === 'renameObject') {
				notEmpty = this.get('notEmpty');
				notTooLargeName = this.get('notTooLargeName');
				notTooLargePath = this.get('notTooLargePath');
				validForm = notEmpty && notTooLargeName && notTooLargePath;
				if(!isModified) {
					this.get('parentView').send('reset');
				}
				else if(validForm) {
					this.get('controller').set('newName', this.get('inputValue'));
				}
			}
			if(!validForm && isModified) {
				this.send('showError');
			}
		}

	}.observes('controller.validationOnProgress').on('init'),

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
			this.$('input').val(this.get('value'));
			this.set('errorMsg', '');
			this.get('controller').set('resetInput', false);
		}
	}.observes('controller.resetInput'),

	eventManager: Ember.Object.create({
		keyUp: function(event, view) {
			var escKey = 27;
			event.stopPropagation();
			if(event.keyCode == escKey) {
				$('body .close-reveal-modal').trigger('click');
			}
		}
	}),

	actions: {
		showError: function(notUnique) {
			var action = this.get('controller').get('actionToExec');
			this.set('errorVisible', false);
			if(notUnique) {
				this.set('errorMsg', 'Already exists');
			}
			else {
				var notEmpty = this.get('notEmpty');
				var notTooLargeName = this.get('notTooLargeName');

				if(!notEmpty) {
					this.set('errorMsg', 'Empty input');
				}
				else if(!notTooLargeName) {
					this.set('errorMsg', 'Too large name. Max: ' + this.get('controller').get('nameMaxLength') + ' bytes');
				}
				else if(action === 'createContainer') {
					var noSlash = this.get('noSlash');
					if(!noSlash) {
						this.set('errorMsg', '"/" is not allowed');
					}
				}
				else if(action === 'createDir') {
					var notTooLargePath = this.get('notTooLargePath');
					if(!notTooLargePath) {
						this.set('errorMsg', 'Too large path. Max: ' + this.get('controller').get('nameMaxLength') + ' bytes')
					}
				}
			}
			this.set('errorVisible', true);
			this.get('controller').set('validationOnProgress', false);
		},
	},
});
