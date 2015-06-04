import Ember from 'ember';
import {TooltipViewMixin} from '../mixins/tooltip';

export default Ember.View.extend(TooltipViewMixin, {
	layoutName: 'overlays/group',
	classNames: ['list-item', 'js-slide-container', 'slide-container', 'clearfix'],
	attributeBindings: ['id'],
	id: function() {
		return 'group-'+this.get('_uuid');
	}.property(),
});
