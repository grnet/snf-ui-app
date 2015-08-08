import Ember from 'ember';
import {DropFileViewMixin} from 'ui-web/snf/dropfile/mixins';
import {SnfAddHandlerMixin} from 'ui-web/snf/dropfile/synnefo';
import {ItemsViewMixin} from 'ui-web/mixins/items'; 
import {RefreshViewMixin} from 'ui-web/snf/refresh';

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

  createNewOnKeyUp: function() {
    var self = this;
    var c = this.get('controller');
    var newKey = 78; // "n"
    $(document).keyup(function(e) {
      if (self.get('canCreate') ){
        if(e.keyCode == newKey) {
          c.send('showDialog', 'create-dir', c);
        }
      }
    });
  }.on('didInsertElement'),
});
