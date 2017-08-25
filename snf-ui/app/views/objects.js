import Ember from 'ember';
import {DropFileViewMixin} from 'snf-ui/snf/dropfile/mixins';
import {SnfAddHandlerMixin} from 'snf-ui/snf/dropfile/synnefo';
import {ItemsViewMixin} from 'snf-ui/mixins/items'; 
import {RefreshViewMixin} from 'snf-ui/snf/refresh';

export default Ember.View.extend(RefreshViewMixin, DropFileViewMixin, SnfAddHandlerMixin, ItemsViewMixin,  {
  refreshTasks: ['controller.model:@controller.settings.modelRefreshInterval'],
  classNames: ['objects'],

  // declare the actions target
  dropFileTarget: Ember.computed.alias('controller.controllers.application'),
  canCreate: Ember.computed.alias('controller.canCreate'),

  dropFileLocation: function(event) {
    var controller = this.get("controller");
    return controller.get("currentPathWithContainer").replace(/\/$/, "");
  },

});
