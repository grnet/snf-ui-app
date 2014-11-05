import Ember from 'ember';

export default Ember.ObjectController.extend({
  needs: ['objects'],

  container_id: Ember.computed.alias('controllers.objects.container_id'),

  view_src: function(){
    var base_url = this.get('settings').get('storage_view_url');
    return base_url+this.get('model').get('id');
  }.property('model.id'),

  /*
  * Pithos API allows the name of objects to have at most 1024 chars.
  * When an object is renamed the length of the new name is checked
  */
  nameMaxLength: 1024,

  validInput: undefined,
  validationOnProgress: undefined,

  newName: undefined,
  actionToExec: undefined,
  isUnique: undefined,
  oldPath: undefined,
  newID: undefined,

  checkUnique: function() {
    if(this.get('newName')) {
      var type = this.get('parentController').get('model').get('type');

      var object = this.get('model');
      var oldID = object.get('id');
      var stripped_name = this.get('newName');

      // oldPath will be used for X-Move-From Header
      var oldPath = '/'+ oldID;
      var temp = oldID.split('/');
      temp.pop();
      temp.push(stripped_name);
      var newID = temp.join('/');

      /*
      * hasRecordForId: Returns true if a record for a given type and ID
      * is already loaded.
      */
      var isUnique = !this.get('store').hasRecordForId(type, newID);

      this.set('newID', newID);
      this.set('oldPath', oldPath)
      this.set('isUnique', isUnique);
    }
  }.observes('newName'),


    renameObject: function(){
      if(this.get('validInput')) {
        var oldPath = this.get('oldPath');
        var newID = this.get('newID');
        var object = this.get('model');
        var self = this;
        var onSuccess = function() {
          console.log('rename object: onSuccess');
          self.send('refreshRoute');
        };

        var onFail = function(reason){
          console.log('renameObject',reason);
          self.send('showActionFail', reason);
        };

      this.store.moveObject(object, oldPath, newID).then(onSuccess, onFail);

      // reset
      this.set('newName', undefined);
      this.set('validInput', undefined);
      this.set('isUnique', undefined);
      this.set('oldPath', undefined);
      this.set('newID', undefined)
    }
  }.observes('validInput'),

  actions: {
    deleteObject: function(){
      var self = this;
      var object = this.get('model');
      var onSuccess = function() {
          console.log('delete object: onSuccess');
      };

      var onFail = function(reason){
        console.log('deleteObject',reason);
        self.send('showActionFail', reason);
      };
      object.deleteRecord();
      object.save().then(onSuccess, onFail);
    },


    validateRename: function(action) {
      var flag = 'validationOnProgress';
      this.set('actionToExec', action);
      this.set(flag, true);
    },

    moveToTrash: function(){
      var object = this.get('model');
      var oldID = object.get('id');
      var oldPath = '/'+ oldID;
      var newID = 'trash/'+object.get('name');
      var self = this;
      var onSuccess = function() {
          console.log('move to trash: onSuccess');
          self.send('refreshRoute');
        };

      var onFail = function(reason){
        console.log('moveToTrash',reason);
        self.send('showActionFail', reason);
      };
      this.store.moveObject(object, oldPath, newID).then(onSuccess, onFail);
    },

    cutObject: function(){
      var object = this.get('model');
      this.set('controllers.objects.toPasteObject', object);
    },

    copyObject: function(){
      var object = this.get('model');
      this.set('controllers.objects.toPasteObject', object);
      this.set('controllers.objects.copyFlag', true);
    },


  }
});

