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
		return encodeURIComponent(this.get('value')).toLowerCase();
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

	adjustSize: function() {
		var self = this;

		return function() {
			var maxSize = self.get('controller').get('nameMaxLength');
			var valueEncoded = self.get('valueEncoded');
			if(valueEncoded.length >= maxSize) {
				var temp = self.get('value');
				var encodedLength;
				for(var i=0; i<maxSize; i++) {
					temp = temp.slice(0, -1);
					encodedLength = encodeURIComponent(temp).length;
					if(encodedLength <= maxSize) {
						self.send('showInfo','The name of the group must be at the most '+maxSize+' (encoded) characters');
						self.set('value', temp)
						self.send('hideInfo')
						break;
					}
				}
			}
		};
	}.property(),

	toLowerCase: function() {
		var self = this;

		return function() {
			var value = self.get('value');
			var valueLower;
			if(value) {
				valueLower = value.toLowerCase();
			}
			if(value !== valueLower) {
				self.set('value', valueLower);
			}
		}
	}.property(),

	isUnique: function() {
		var self = this;
		return function() {
			self.get('controller').set('newName', self.get('value'))
			if(self.get('controller').get('isUnique')) {
				console.log('IS UNIQUE')
			}
			else {
				self.send('showInfo', 'Already exists', true)
			}
		};
	}.property(),


	eventManager: Ember.Object.create({
		keyUp: function(event, view) {
			view.send('hideInfo', true)
			var value = view.$('input').val();
			view.set('value', value);
			if(view.get('notEmpty')) {
				Ember.run.debounce(view, function() {
					console.log(view.get('value'))
					view.get('toLowerCase')();
					view.get('adjustSize')();
					view.get('isUnique')();
				}, 300);
			}
		},
		focusOut: function(event, view) {
			if(!view.get('notEmpty')) {
				view.send('showInfo', 'This can\'t be empty.', true);
			}
		},
	}),
	reset: function() {
		if(this.get('controller').get('resetInputs')) {
			this.set('value', undefined);
			this.set('warningVisible', false);
			this.set('errorVisible', false);
			var resetedInputsNum =  this.get('controller').get('resetedInputs');
			this.get('controller').set('resetedInputs', (this.get('controller').get('resetedInputs') + 1));
		}
	}.observes('controller.resetInputs'),
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
					this.set('errorVisible', false);
			}
			else {
				setTimeout(function() {
					self.set('warningVisible', false);
				}, 5000);
			}
		}
	}

});
