import Ember from 'ember';

export default Ember.View.extend({
	templateName: 'containers',
	didInsertElement: function() {
		var self = this;
		this.$('.toggle-view').click(function() {
			self.$('.containers').toggleClass('grid-view');
			self.$('.part.two').toggleClass('columns small-2')
			self.$('.part.four').toggleClass('columns small-4')
		});
		this.$('.new-container .show-form, .new-container .cancel').click(function() {
			var $newCont = $(this).closest('.containers').find('.new-container'),
				$parts = $newCont.find('.slide-area'),
				$btn = $newCont.find('.show-form');

			if($newCont.hasClass('open')) {
				$parts.slideUp('slow', function() {
					$newCont.removeClass('open')
				});
			}
			else {
				$parts.slideDown('slow');
				$newCont.addClass('open')
			}
		});
	},
	allowToggleView: false,
});
