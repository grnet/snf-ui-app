import Ember from 'ember';

export default Ember.View.extend({
	layoutName: 'overlays/group',
	classNames: ['list-item', 'js-slide-container', 'slide-container', 'clearfix'],
	attributeBindings: ['id'],
	id: function() {
		return 'group-'+this.get('_uuid');
	}.property(),
  remove_last_user: function() {
    return this.get('id') + '_remove_last_user';
  }.property('id')
});
