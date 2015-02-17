import Ember from 'ember';

export default Ember.View.extend({
	classNames: ['reveal-modal'],
	attributeBindings: ['data-reveal'],
	'data-reveal': true,

	revealDialog: function() {
		this.$().foundation('reveal', 'open');
	}.on('didInsertElement'),

	closeDialog: function() {
		var closeDialog = this.get('controller').get('closeDialog');
		if(closeDialog) {
			this.$().foundation('reveal', 'close');
			this.get('controller').set('closeDialog', false)
		}
	}.observes('controller.closeDialog'),

	didInsertElement: function() {
		var self = this;
		/*
		 *  templateName could be:
		 * - dialogs.error
		 * - dialogs.feedback etc
		 */
		var templateName = this.get('renderedName');

		// type is used to disconnect the dialog from the correct outlet
		var type = templateName.replace('dialogs.', '');

		$(document).on('closed.fndtn.reveal', '[data-reveal]', function () {
			self.get('controller').send('removeDialog', type);
		});
		this._super();

		$('.slide-btn').click(function(e) {
			e.preventDefault();
			self.$('.slide-me').slideToggle('slow')
		})
	},
	/*
	 * Every event handler that has bound with the current view should be removed
	 * before the view gets destroyed
	 */
	willDestroy: function() {
		$(document).find('.reveal-modal-bg').remove();
		$(document).off('closed.fndtn.reveal', '[data-reveal]');
		this._super();
	},
	// Use in the confirmSimple dialog
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
		action_verb: 'Delete'
	},
	emptyContainer: {
		title: "Empty Container",
		action_verb: 'Empty'
	}
});
