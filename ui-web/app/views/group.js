import Ember from 'ember';

export default Ember.View.extend({
	classNames: ['list-item', 'js-slide-container', 'slide-container', 'clearfix'],
	templateName: 'dialogs/group',
	attributeBindings: ['id'],
	id: function() {
		return 'group-'+this.get('_uuid');
	}.property(),
});
