import Ember from 'ember';
import {DropFileViewMixin} from 'ui-web/snf/dropfile/mixins';

export default Ember.View.extend(DropFileViewMixin, {
  // declare the actions target
  dropFileTarget: Ember.computed.alias('controller.controllers.application'),

  dropFileLocation: function(event) {
    var controller = this.get("controller");
    return controller.get("model.id").replace(/\/$/, "");
  },

	layoutName: 'container',
	tagName: 'li',
	classNameBindings: ['isNew', 'isLoading', 'isTrash'],

  isNew: Ember.computed.alias("controller.isNew"),
  isLoading: Ember.computed.alias("controller.isLoading"),
	isTrash: Ember.computed.alias("controller.isTrash"),
});
