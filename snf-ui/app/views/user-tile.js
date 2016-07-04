import Ember from 'ember';

export default Ember.View.extend({
	templateName: 'user-tile',
	tagName: 'span',
	classNames: ['tile'],
	classNameBindings: ['status_cls'],
	status_cls: function() {
		// status values: success, loading, error
		var status = this.get('user.status');
		if(status === 'success') {
			return 'success-revert';
		}
		else if (status === 'error') {
			return 'danger-revert';
		}
		else {
			return status;
		}
	}.property('user.status')
});
