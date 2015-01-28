import Ember from 'ember';

export default Ember.View.extend({
	templateName: 'input-emails',
	classNames: ['input-emails', 'input-with-valid'],
	didInsertElement: function() {},

	eventManager: Ember.Object.create({
		input: function(event, view) {}
	}),
});
