import Ember from 'ember';
import ObjectController from '../object';

export default ObjectController.extend({

  needs: ['objects'],

  actions: {
    version: function(object) {
      var newID = object._newID;
      var copyFlag = object._copyFlag;
      delete object._newID;
      delete object._newVerifiedID;
      delete object._copyFlag;
      this.get('controllers.objects').send('moveObject', object, newID, copyFlag); 
    },
    copy: function(object) {
      var newVerifiedID = object.get('_newVerifiedID');
      var copyFlag = object._copyFlag;
      delete object._newID;
      delete object._newVerifiedID;
      delete object._copyFlag;
      this.get('controllers.objects').send('moveObject', object, newVerifiedID, copyFlag); 
    }
  }
});
