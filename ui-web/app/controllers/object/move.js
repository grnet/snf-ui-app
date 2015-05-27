import Ember from 'ember';
import ObjectController from '../object';

export default ObjectController.extend({

  needs: ['objects'],

  actions: {
    
    prepareMove: function(object, versionFlag){
      var self = this;
      var newID = object._newID;
      var newVerifiedID = object._newVerifiedID;
      var copyFlag = object._copyFlag;
      var callback = object._callback;
      delete object._newID;
      delete object._newVerifiedID;
      delete object._copyFlag;
      delete object._callback;

      // if versionFlag is set to true, a new object of the version will be 
      // created. If not, it will be renamed
      var ID = versionFlag ? newID: newVerifiedID;
      var p = {
        copyFlag: copyFlag,
        callback: callback,
        ID: ID,
      }

      // Ugly: wait for the dialog to close before opening a new dialog
      Ember.run.later(p, function(){
        self.get('controllers.objects').send('moveObject', object, p.ID, p.copyFlag, p.callback); 
      }, 200);
  
    },

    version: function(object) {
      this.send('prepareMove', object, true);
    },
    copy: function(object) {
      this.send('prepareMove', object);
    }
  }
});
