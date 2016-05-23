import Ember from 'ember';

export default Ember.View.extend({
	templateName: 'overlays/quotas-per-project',
	tagName: 'li',
	minWidth: 2, //percent
	// If the diskspace usage is more then 80% but not more then 100% returns true
	isNearFull: function() {
		if((this.get('usage_percentage') > 80) && (this.get('usage_percentage') <= 100)) {
			return true;
		}
		return false;
	}.property('usage_percentage'),

	// If the the usage is more then the available quotas returns true
	isOverquota: function() {
		if(this.get('project').get('diskspace_overquota_space') > 0) {
			return true;
		}
		return false;
	}.property('diskspace_overquota_space'),

	usage_percentage: function() {
		var usage = this.get('project').get('diskspace_user_usage');
		var limit = this.get('project').get('diskspace_effective_limit');
		if(limit > usage) {
			return ((usage/limit)*100).toFixed(2);
		}
		return 100;
	}.property('diskspace_user_usage', 'diskspace_effective_limit'),

	width_usage: function(){
		var usage_percentage = this.get('usage_percentage');
		var min_width = this.get('minWidth'); 
		if(usage_percentage < min_width && usage_percentage) {
			return 'width:' + min_width + '%';
		}
		else if(usage_percentage > 100){
			return 'width:100%';
		}
		else {
			return 'width:' + usage_percentage + '%';
		}
	}.property('usage_percentage'),

	width_free: function() {
		var usage_percentage = this.get('usage_percentage');
		var min_width = this.get('minWidth');
		if(usage_percentage < min_width) {
			return 'width:' + (100 - min_width) + '%';
		}
		else if(usage_percentage > 100){
			return 'width:0%';
		}
		else {
			return 'width:' + (100 - usage_percentage) + '%';
		}
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
