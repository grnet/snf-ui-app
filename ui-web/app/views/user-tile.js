import Ember from 'ember';

export default Ember.View.extend({
	templateName: 'user-tile',
	tagName: 'span',
	classNames: ['tile'],
	classNameBindings: ['status'],
	status: function() {
		return this.get('user.status');
	}.property('user.status')
});
