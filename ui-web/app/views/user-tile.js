import Ember from 'ember';

export default Ember.View.extend({
	templateName: 'user-tile',
	tagName: 'span',
	classNames: ['tile'],
	classNameBindings: ['curState'],
	curState: function() {
		console.log(this.get('user.curState'));
		return this.get('user.curState');
	}.property()
});
