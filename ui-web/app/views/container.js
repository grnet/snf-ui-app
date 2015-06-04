import Ember from 'ember';

export default Ember.View.extend({
	layoutName: 'container',
	tagName: 'li',
	classNameBindings: ['isNew', 'isLoading', 'isTrash'],

  isNew: Ember.computed.alias("controller.isNew"),
  isLoading: Ember.computed.alias("controller.isLoading"),
	isTrash: Ember.computed.alias("controller.isTrash"),
});
