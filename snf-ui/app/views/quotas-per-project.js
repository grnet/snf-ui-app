import Ember from 'ember';

export default Ember.View.extend({
	templateName: 'overlays/quotas-per-project',
	tagName: 'li',
	minWidth: 2, //percent

	width_usage: function(){
		var usage_percentage = this.get('project').get('usage_percentage');
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
	}.property('project.usage_percentage'),

	width_free: function() {
		var usage_percentage = this.get('project').get('usage_percentage');
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
	}.property('project.usage_percentage'),

	position_label: function() {
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
