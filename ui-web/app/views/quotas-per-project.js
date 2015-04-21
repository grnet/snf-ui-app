import Ember from 'ember';

export default Ember.View.extend({
	templateName: 'quotas-per-project',
	tagName: 'li',
	minWidth: 2, //percent
	warningFull: function() {
		if(this.get('usage_percentage')> this.get('project').get('diskspace_user_limit')*0.8 ) {
			return true;
		}
		return false;
	}.property('usage_percentage'),

	usage_percentage: function() {
		var usage = this.get('project').get('diskspace_user_usage');
		var limit = this.get('project').get('diskspace_effective_limit');
		if(limit) {
			return ((usage/limit)*100).toFixed(2);
		}
		return 100;
	}.property('usage_percentage', 'diskspace_effective_limit'),

	width_usage: function(){
		var usage_percentage = this.get('usage_percentage');
		var min_width = this.get('minWidth'); 
		if(usage_percentage < min_width && usage_percentage) {
			return 'width:' + min_width + '%';
		}
		return 'width:' + usage_percentage + '%';
	}.property('usage_percentage'),

	width_free: function() {
		var usage_percentage = this.get('usage_percentage');
		var min_width = this.get('minWidth');
		if(usage_percentage < min_width) {
			return 'width:' + (100 - min_width) + '%';
		}
			return 'width:' + (100 - usage_percentage) + '%';
	}.property('usage_percentage'),
	posLabel: function() {
		if(!this.get('parentView').get('no-display')) {
			var sizeWidth = this.$('.size').outerWidth();
			var meterWidth = this.$('.meter').width();
			var restWidth = this.$('.rest').width();
			var totalWidth = restWidth + meterWidth;
			var pos;
			if(this.$().is(':visible')) {
				if(sizeWidth > meterWidth) {
					pos = meterWidth;
					this.$('.size').css('left', pos + 'px');
				}
				else {
					pos = restWidth;
					this.$('.size').css('right', pos + 'px');
				}
				this.$('.size').addClass('appear');
			}
		}
	}.observes('parentView.no-display').on('init'),

});
