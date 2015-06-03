import Ember from 'ember';
import ObjectController from 'ui-web/controllers/object';

export default ObjectController.extend({

  needs: ['objects'],

  actions: {
    
    prepareMove: function(object, versionFlag){
      var self = this;
      var newID = object._newID;
      var newVerifiedID = object._newVerifiedID;
      var copyFlag = object._copyFlag;
      var callback = object._callback;
      var next = object._next;
      var source_account = object._source_account;
      delete object._newID;
      delete object._newVerifiedID;
      delete object._copyFlag;
      delete object._callback;
      delete object._next;
      delete object._source_account;

      // if versionFlag is set to true, a new object of the version will be 
      // created. If not, it will be renamed
      var ID = versionFlag ? newID: newVerifiedID;
      var p = {
        copyFlag: copyFlag,
        callback: callback,
        ID: ID,
        next: next,
        source_account: source_account
      }

      // Ugly: wait for the dialog to close before opening a new dialog
      Ember.run.later(p, function(){
        self.get('controllers.objects').send('moveObject', object, p.ID, p.copyFlag, p.source_account,  p.callback, p.next); 
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
