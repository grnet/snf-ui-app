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

	/*
	* Errors: empty, already exists
	* Warnings: too large
	*/

	value: undefined,

	valueEncoded: function() {
		return encodeURIComponent(this.get('value'));
	}.property('value'),

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

	/*
	* permitLower and checkSize are used to synchronise the adjustSize and
	* toLowerCase functions. The synchronisation is necessary because both
	* of them may modify the value of the input.
	*/
	permitLower: false,
	checkSize: false,
	typingValidOnProgress: false,
	focusOutValidOnProgress: false,

	adjustSize: function() {
		this.set('permitLower', false);
		if(this.get('checkSize')) {
			var maxSize = this.get('controller').get('nameMaxLength');
			var valueEncoded = this.get('valueEncoded');
			if(valueEncoded.length >= maxSize) {
				var temp = this.get('value');
				var encodedLength;
				for(var i=0; i<maxSize; i++) {
					temp = temp.slice(0, -1);
					encodedLength = encodeURIComponent(temp).length;
					if(encodedLength <= maxSize) {
						this.send('showInfo','The name of the group must be at the most '+maxSize+' (encoded) characters');
						this.set('value', temp)
						this.send('hideInfo')
						break;
					}
				}
			}
			this.set('checkSize', false);
			this.set('permitLower', true)
		}
	}.observes('checkSize'),

	toLowerCase: function() {
		if(this.get('permitLower')) {
			var self = this;
			var value = this.get('value');
			var valueLower = value.toLowerCase();
			if(value !== valueLower) {
				setTimeout(function() {
					self.set('value', valueLower);
					// self.send('showInfo','Capital letters are not allowed');
				}, 300);
			}
			this.set('permitLower', false);
		}
		this.set('typingValidOnProgress', false);
	}.observes('permitLower'),


	eventManager: Ember.Object.create({
		input: function(event, view) {
			var value = view.$('input').val();

			view.set('typingValidOnProgress', true);
			view.set('value', value);
			view.set('checkSize', true);
		},

		focusOut: function(event, view) {
			view.set('focusOutValidOnProgress', true);
		},
		focusIn: function(event, view) {
			view.send('hideInfo', true);
		}
	}),

	finalValidations: function() {
		var typingValidOnProgress = this.get('typingValidOnProgress');
		var focusOutValidOnProgress = this.get('focusOutValidOnProgress');
		if(!typingValidOnProgress && focusOutValidOnProgress) {
			if(this.get('notEmpty')) {
				this.get('controller').set('newName', this.get('valueEncoded'))
				if(this.get('controller').get('isUnique')) {
					console.log('IS UNIQUE')
				}
				else {
					this.send('showInfo', 'Already exists', true)
				}
			}
			else {
				this.send('showInfo', 'Empty input', true)
			}
		}
		this.set('focusOutValidOnProgress', false);
	}.observes('typingValidOnProgress', 'focusOutValidOnProgress'),

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
		hideInfo: function(isError) {
			var self = this;
			if(isError) {
				this.$('span.error').slideUp('slow', function() {
					self.set('errorVisible', false);
				});
			}
			else {
				setTimeout(function() {
					self.$('span.warning').slideUp('slow', function() {
						self.set('warningVisible', false);
					});
				}, 5000);
			}
		}
	}

});
