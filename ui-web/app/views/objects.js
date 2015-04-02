import Ember from 'ember';
import {DropFileViewMixin} from '../snf/dropfile/mixins';
import {SnfAddHandlerMixin} from '../snf/dropfile/synnefo';


export default Ember.View.extend(DropFileViewMixin, SnfAddHandlerMixin, {

  // declare the actions target
  dropFileTarget: Ember.computed.alias('controller.controllers.application'),

  dropFileLocation: function(event) {
    var controller = this.get("controller");
    return controller.get("path").replace(/\/$/, "");
  }
});
