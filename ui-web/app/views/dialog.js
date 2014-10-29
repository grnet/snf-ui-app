import Ember from 'ember';

export default Ember.View.extend({
	classNames: ['reveal-modal'],
	attributeBindings: ['data-reveal'],
	'data-reveal': true,

	revealDialog: function() {
		this.$().foundation('reveal', 'open');
	}.on('didInsertElement'),

	didInsertElement: function() {
		var self = this;
		$(document).on('closed.fndtn.reveal', '[data-reveal]', function () {
	  	self.get('controller').send('removeModal');
		});
		this._super();
	},

	title: function() {
		var action = this.get('controller').get('actionToPerform');
		return this.get(action).title;
	}.property(),

	actionVerb: function() {
		var action = this.get('controller').get('actionToPerform');
		return (this.get(action).action_verb);
	}.property(),

	// Actions metadata
	deleteContainer: {
		title: 'Delete Container',
		action_verb: 'delete'
	},
	emptyContainer: {
		title: "Empty Container",
		action_verb: 'empty'
	}
});
