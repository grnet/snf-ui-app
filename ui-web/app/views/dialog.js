import Ember from 'ember';

export default Ember.View.extend({
	classNames: ['reveal-modal'],
  classNameBindings: ['templateCls'],
	attributeBindings: ['data-reveal'],
	'data-reveal': 'true',
  layoutName: 'dialog-wrapper',


  /*  Assign a class to each dialog
  * Available classes:
  * tiny: Set the width to 30%.
  * small: Set the width to 40%.
  * medium: Set the width to 60%.
  * large: Set the width to 70%. (default)
  * xlarge: Set the width to 95%.
  * full: Set the width and height to 100%.
  */
  templateCls: function(){
    var clsMap = {
      'dialogs.create-dir': 'small',
      'dialogs.confirm-simple': 'small', 
      'dialogs.feedback': 'medium',
      'dialogs.move': 'small',
      'dialogs.restore': 'medium',
    }
    return clsMap[this.get('renderedName')];
  }.property('renderedName'),

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
			// this bubbles up to application route
			self.get('controller').send('removeDialog', type);
			if(self.get('controller').get('name') === 'groups') {
				self.get('controller').set('usersExtended', []);
			}
		});
		this._super();

		$('.slide-btn').click(function(e) {
			e.preventDefault();
			self.$('.slide-me').slideToggle('slow');
		});
    
    $('.close-modal').on('click', function(){
      self.$().foundation('reveal', 'close');
    });

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

	/*
	* slideInnerArea is used to hide an area inside the dialog.
	* For now it is used for the create group area. This should be
	* moved from here. Maybe it should be placed in groups view or
	* create_group view.
	*/
	slideInnerArea: function(){
		if(this.get('controller').get('completeReset')) {
			this.$('.slide-me').slideUp('slow');
		}
	}.observes('controller.completeReset'),

	// Actions metadata
	emptyAndDelete: {
		title: 'Delete Container',
		action_verb: 'Delete'
	},
	emptyContainer: {
		title: "Empty Container",
		action_verb: 'Empty'
	}
});
