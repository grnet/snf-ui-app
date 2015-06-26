import Ember from 'ember';

export default Ember.View.extend({
	classNames: ['reveal-modal'],
	classNameBindings: ['templateCls'],
	attributeBindings: ['data-reveal'],
	'data-reveal': 'true',
	layoutName: 'overlays/dialog-wrapper',
	needReset: ['overlays.groups', 'overlays.sharing'],
	rerenderPopovers: false,


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
      'overlays.create-dir': 'tiny',
      'overlays.confirm-simple': 'small', 
      'overlays.feedback': 'medium',
      'overlays.restore': 'small',
      'overlays.paste': 'small',
      'overlays.create-container': 'tiny',
      'overlays.groups': 'medium',
    }
    return clsMap[this.get('renderedName')];
  }.property('renderedName'),

	revealDialog: function() {
		this.$().foundation('reveal', 'open', {
			animation: 'fade',
			animation_speed: 250,
		});
	}.on('didInsertElement'),

	/*
	 * CloseDialog can be used if you want to trigger the closing action
	 * from the controller.
	 * For example, use it if you want to do reset actions in the views,
	 * that are included inside the dialog, before the dialog gets hidden
	 * or removed from the DOM. In this case the controller that is related
	 * with the dialog must have the property closeDialog. This prop will
	 * be updated when all child-views finish with their actions.
	*/
	closeDialog: function() {
		var closeDialog = this.get('controller').get('closeDialog');

		if(closeDialog && this.get('_state') === 'inDOM') {
			this.$().foundation('reveal', 'close', {
				animation: 'fade',
				animation_speed: 100,
			});
			this.get('controller').set('closeDialog', false)
		}
	}.observes('controller.closeDialog'),

	didInsertElement: function() {

		this._super();

		var self = this;

		// templateName could be: overlays.error or overlays.feedback etc
		var templateName = this.get('renderedName');

		// type is used to disconnect the dialog from the correct outlet
		var type = templateName.replace('overlays.', '');

		// for close btns that are not "x" like cancel
		$('.js-btn-close-modal').on('click', function(e){
      e.preventDefault();
			if(self.get('controller').get('name') === 'groups') {
				self.$('.open').find('.js-btn-slide').each(function(){
					$(this).trigger('click');
				});
			}
			self.$().foundation('reveal', 'close', {
				animation: 'fade',
				animation_speed: 100,
			});
	    });

		$(document).on('close.fndtn.reveal', '[data-reveal]', function () {
			if(self.get('_state') === 'inDOM') {
				if(self.get('controller').get('name') === 'groups') {
					self.$('.open').find('.js-btn-slide').each(function(){
						$(this).trigger('click');
					});
				}
				else if(self.get('controller').get('name') === 'sharing') {
					self.get('controller').send('reset');
				}

			}
		});

		$(document).on('closed.fndtn.reveal', '[data-reveal]', function () {
				// this bubbles up to application route
				self.get('controller').send('removeDialog', type);
		});

	    $(document).on('opened.fndtn.reveal', '[data-reveal]', function () {
	      var dialog = $(this);
	      dialog.find('[autofocus]').focus();
	    });
	},
	/*
	 * Every event handler that has bound with the current view should be removed
	 * before the view gets destroyed
	 */
	willDestroyElement: function() {
	    $(document).find('.reveal-modal-bg').remove();
	    $(document).off('click', '[data-reveal] .js-btn-slide');
	    // check off(close)
	    $(document).off('close.fndtn.reveal', '[data-reveal]');
	    // check off(closed)
	    $(document).off('closed.fndtn.reveal', '[data-reveal]');
	    $(document).off('opened.fndtn.reveal', '[data-reveal]');
	},

  confirm_title: function(){
    return this.get('controller.verb_for_action') + ' ' + this.get('controller.itemType');
  }.property('controller.verb_for_action', 'controller.itemType'),


	actions: {
		/*
		 * slide action slides down a closed area and focuses the 1st input in it
		 * or if the area is open, it slides it up and send to the corresponting
		 * controller the action reset
		*/
		slide: function(controller, areaID, action) {
			var self = this;
			var $area = this.$('.js-slide-container#'+areaID);
			$area.toggleClass('open');
			var toOpen = $area.hasClass('open');

			if(action) {
				controller.send(action);
			}

			if(toOpen) {
				$area.find('.js-slide-me').stop().slideDown('slow', function() {
					$area.find('input:first').focus();
					self.set('rerenderPopovers', true);
					console.log('-----')
				});
			}
			else {
				$area.find('.js-slide-me').stop().slideUp('slow', function() {
					if(controller.get('name') === 'groups') {
						controller.send('reset');
					}
				});
			}


		}
	},

	deleteGroup: {
		title: 'Delete Group',
		action_verb: 'delete'
	}


});
