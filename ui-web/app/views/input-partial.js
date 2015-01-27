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

	permitLower: false,
	checkSize: false,

	adjustSize: function() {
		this.set('permitLower', false);
		if(this.get('checkSize')) {
			var maxSize = this.get('controller').get('nameMaxLength');
			var valueEncoded = this.get('valueEncoded');
			if(valueEncoded.length >= maxSize) {
				var tempenc;
				var temp = this.get('value');
				var encodedLength;
				for(var i=0; i<maxSize; i++) {
					temp = temp.slice(0, -1);
					encodedLength = encodeURIComponent(temp).length;
					if(encodedLength <= maxSize) {
						this.send('showInfo','The name of the group must be at the most '+maxSize+' (encoded) characters', true);
						this.set('value', temp)
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
					self.send('showInfo','Capital letters are not allowed');
				}, 300);
			}
			this.set('permitLower', false)
		}
	}.observes('permitLower'),


	eventManager: Ember.Object.create({
		input: function(event, view) {
			var event = event['type'];
			var actions = view.get(event);
			var actions = actions.split(' ');
			var value = view.$('input').val();

			view.set('value', value);
			view.set('checkSize', true);
		},

		focusOut: function(event, view) {
			var event = event['type'];
			var actions = view.get(event);
			var actions = actions.split(' ');
			view.set('warningVisible', false);
			if(view.get('notEmpty')) {
				console.log('NOT EMPTY')
				if(view.get('controller').get('isUnique')) {
					console.log('PAME STO EPOMENO contoller.nameValid = true')
				}
				else {
					view.send('showInfo', 'Already exists', true)
				}

			}
			else {
				view.send('showInfo', 'Empty input', true)
			}
		}
	}),

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
		}
	}

});
