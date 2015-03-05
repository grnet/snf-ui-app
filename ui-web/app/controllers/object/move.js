import Ember from 'ember';
import ObjectController from '../object';

export default ObjectController.extend({

  needs: ['objects'],

  actions: {
    version: function(object) {
      var newID = object._newID;
      delete object._newID;
      delete object._newVerifiedID;
      this.get('controllers.objects').send('moveObject', object, newID); 
    },
    copy: function(object) {
      var newVerifiedID = object.get('_newVerifiedID');
      delete object._newID;
      delete object._newVerifiedID;
      this.get('controllers.objects').send('moveObject', object, newVerifiedID); 
    }
  }
});
