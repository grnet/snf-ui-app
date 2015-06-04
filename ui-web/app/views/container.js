import Ember from 'ember';
import {TooltipViewMixin} from '../mixins/tooltip';

export default Ember.View.extend(TooltipViewMixin, {
	layoutName: 'container',
	tagName: 'li',
	classNameBindings: ['isNew', 'isLoading', 'isTrash'],

  isNew: Ember.computed.alias("controller.isNew"),
  isLoading: Ember.computed.alias("controller.isLoading"),
	isTrash: Ember.computed.alias("controller.isTrash"),
});
