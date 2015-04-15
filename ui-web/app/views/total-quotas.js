import Ember from 'ember';

export default Ember.View.extend({
	templateName: 'total-quotas',
	classNames: 'quotas-container',
	hidden: true,

	didInsertElement: function() {
		var self = this;
		var $usageBtn = this.$('.usg-btn');

		$usageBtn.click(function(e) {
			if(self.$('.hidden').length >0) {
				self.$('.hidden').fadeIn(function() {
					$(this).removeClass('hidden');
					if(self.get('hidden')) {
						self.set('hidden', false);
					}
				});
			}
			else {
				self.$('.container').fadeOut(function() {
					$(this).addClass('hidden');
					self.set('hidden', true);
				});
			}
		});

		$(document).mouseup(function(e) {
			var $quotas = self.$();
			if(!$quotas.is(e.target) && $quotas.has(e.target).length === 0) {
				if(self.$('.hidden').length === 0) {
					$usageBtn.trigger('click');
				}
			}
		});
	}

});
