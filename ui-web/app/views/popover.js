import Ember from 'ember';

export default Ember.View.extend({
	classNames: ['popover'],
	classNameBindings: ['position', 'cls', 'no-display'],
	'no-display': true,
	templateName: 'popover',

	// Use in the confirmSimple dialog
	title: function() {
		var action = this.get('actionToPerform');
		return this.get(action).title;
	}.property(),

	actionVerb: function() {
		var action = this.get('actionToPerform');
		return (this.get(action).action_verb);
	}.property(),


	toggleVisibility: function() {
		var self = this;
		var $triggerBtn = $(document).find('['+'data-popover-trigger='+this.get('triggerBy')+']');

		$triggerBtn.click(function(e) {
			if(self.get('no-display')) {
				self.send('openPopover');
			}
			else {
				self.send('closePopover');
			}
		});

		$(document).mouseup(function(e) {
			var $popover = self.$('.wrap');
			if(!$popover.is(e.target) && $popover.has(e.target).length === 0) {
				if(!self.get('no-display')) {
					self.send('closePopover');
				}
			}
		});
	}.on('didInsertElement'),

	actions: {
		openPopover: function() {
			var self = this;
			this.$().fadeIn(function() {
				self.set('no-display', false);
			});
		},

		closePopover: function() {
			var self = this;
				this.$().fadeOut(function() {
					self.set('no-display', true);
				});
		},
	},

	// Actions metadata that may need them in tooltips
	deleteGroup: {
		title: 'Delete Group',
		action_verb: 'Delete'
	}
});
