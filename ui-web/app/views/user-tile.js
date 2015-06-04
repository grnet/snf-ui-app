import Ember from 'ember';
import {TooltipViewMixin} from '../mixins/tooltip';

export default Ember.View.extend(TooltipViewMixin, {
	templateName: 'user-tile',
	tagName: 'span',
	classNames: ['tile'],
	classNameBindings: ['status'],
	status: function() {
		return this.get('user.status');
	}.property('user.status')
});
