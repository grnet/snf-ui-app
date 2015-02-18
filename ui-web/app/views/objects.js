import Ember from 'ember';
import {DropFileViewMixin} from '../snf/dropfile/mixins';


export default Ember.View.extend(DropFileViewMixin, {

  // declare the actions target
  dropFileTarget: Ember.computed.alias('controller.controllers.application'),

  dropFileLocation: function(event) {
    var controller = this.get("controller");
    return controller.get("path").replace(/\/$/, "");
  }
});
