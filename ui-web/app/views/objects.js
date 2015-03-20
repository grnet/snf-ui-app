import Ember from 'ember';
import {DropFileViewMixin} from '../snf/dropfile/mixins';


export default Ember.View.extend(DropFileViewMixin, {

  // declare the actions target
  dropFileTarget: Ember.computed.alias('controller.controllers.application'),

  dropFileLocation: function(event) {
    var controller = this.get("controller");
    return controller.get("path").replace(/\/$/, "");
  },

  dropFileAddHandler: function(file) {
    return new Ember.RSVP.Promise(function(resolve, reject) {
      var store = this.get('controller.store');
      store.findById('object', file.get('path')).then(function() {
        var msg = "File '${file.get('path')}'" +
                  " already exists. Do you want to overwrite ?";
        var overwrite = window.confirm(msg);
        if (overwrite) { resolve(file); return; }
        
        var newname = file.get('name').replace(/(\..*$)/, '_renamed_$1');
        var rename = window.prompt("Do you want to rename?", newname);
        if (rename) {
          file.set('name', rename);
          this.dropFileAddHandler(file).then(resolve, reject);
        } else {
          reject(file);
        }
      }.bind(this)).catch(function() {
        resolve(file);
      });
    }.bind(this));
  }
});
