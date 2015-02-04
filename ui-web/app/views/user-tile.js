import Ember from 'ember';

export default Ember.View.extend({
	templateName: 'user-tile',
	tagName: 'span',
	classNames: ['tile'],
	classNameBindings: ['status'],
	status: function() {
		console.log('!######',this.get('user').get('status'));
		console.log('######',this.get('model'));
		return this.get('user.status');
	}.property('user.status')
});
