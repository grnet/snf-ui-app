import Ember from 'ember';
import {tempSetProperty} from '../snf/common';

export default Ember.ArrayController.extend({
  needs: ['application'],
  itemController: 'object',
  sortProperties: ['is_file', 'stripped_name'],
  closeDialog: false,

  hasUpPath: function(){
    return this.get('current_path') !== '/';
  }.property('current_path'),

  upPath: function(){
    var arr =  this.get('current_path').split('/');
    arr.pop();
    return arr.join('/');
  }.property('current_path'),

  path: function(){
    var url =  this.get('container_id')+'/';
    if (this.get('current_path') !== '/') {
      url = url + this.get('current_path')+ '/';
    }
    return url;
  }.property('current_path'),

  objectsCount: function(){
    return this.get('length');
  }.property('@each'),

  selectedC: Ember.computed.filterBy("@this", "isSelected", true),

  selected: function(){
    var objects = [];
    this.get('selectedC').forEach(function(s){
      objects.pushObject(s.get('model'));
    });
    return objects;
  }.property('selectedC.@each'),

  hasSelected: function(){
    return this.get('selectedC').length > 0;
  }.property('selectedC.@each'),

  toPasteObject: null,

  copyFlag: false,

 /*
 * Pithos API allows the name of objects to have at most 1024 chars
 * When a new object is created the length of the name is checked
 */
  nameMaxLength: 1024,

  validInput: undefined,
  validationOnProgress: undefined,

  newName: undefined,
  actionToExec: undefined, // needs to be set when input is used (for the view)
  isUnique: undefined,
  newID: undefined,

  checkUnique: function() {
    if(this.get('newName')) {

      var temp = [];
      var name = this.get('newName');
      temp.push(this.get('container_id'));

      if (this.get('hasUpPath')) {
        temp.push(this.get('current_path'));
      }
      temp.push(name);
      var newID = temp.join('/');
      
      /*
      * hasRecordForId: Returns true if a record for a given type and ID
      * is already loaded.
      * In our case the id of a container it's its name.
      */
      var isUnique = !this.get('store').hasRecordForId('object', newID);
      this.set('newID', newID);
      this.set('isUnique', isUnique);
    }
  }.observes('newName'),

  createDir: function(){
    if(this.get('validInput')) {
      var self = this;
      var name = this.get('newName');
      if (this.get('hasUpPath')) {
        name = this.get('current_path') + '/' + name;
      }
      var id = this.get('newID');

      var object = this.store.createRecord('object', {
        id: id,
        name: name,
        content_type: 'application/directory',
      });

      var onSuccess = function(object) {
        tempSetProperty(object, 'new');
        self.send('refreshRoute');
      };

      var onFail = function(reason){
        console.log('onFail');
        console.log(reason);
      };

      object.save().then(onSuccess, onFail);
      this.set('newName', undefined);
      this.set('validInput', undefined);
      this.set('isUnique', undefined);
      this.set('newID', undefined);
			this.set('closeDialog', true);
    }
  }.observes('validInput'),


  _verifyID: function(id){
    var self = this;
    return function(id){
      var obj = self.store.getById('object',id );
      if (obj) {
        if (obj.get('is_dir') ) {
          var object_id = id + '-copy';
        } else {
          var temp = id.split('.');
          var extension = null;
          if (temp.length>1 ) {
            extension = '.'+ temp.pop();
          }
          object_id = temp.join('.')+'-copy';
          if (extension) {
            object_id = object_id + extension;
          }
        }
        // if you omit return _verifyID returns undefined
        return self.get('_verifyID')(object_id);
      } else {
        return id;
      }
    }
  }.property(),


  actions: {

    validateCreation: function(action) {
      var flag = 'validationOnProgress';
      this.set('actionToExec', action);
      this.set(flag, true);
    },

    pasteObject: function(){
      if (!this.get('toPasteObject')){
        console.log('Nothing has been cut or copied');
        return false;
      }
      var object = this.get('toPasteObject');
      var current_path = (this.get('current_path') === '/')? '/': '/'+this.get('current_path')+'/';
      var newID = this.get('container_id')+current_path+object.get('stripped_name');
      var copyFlag = this.get('copyFlag');

      this.send('_move', object, newID, copyFlag);
    
    },

    _move: function(object, newID, copyFlag){
      var self = this;
      var arr = newID.split('/');
      var container_id = arr.shift();
      arr.pop();
      var path = arr.join('/')+'/';
      this.store.find('object', {
        container_id: container_id,
        path: path
      }).then(function(){
        var newVerifiedID = self.get('_verifyID')(newID);
        if (newVerifiedID != newID){
          object._newID = newID;
          object._newVerifiedID = newVerifiedID;
          object._copyFlag = copyFlag;
          self.send('showDialog', 'move', 'object/move' , object);
          return;
        }
        self.send('moveObject', object,newID, copyFlag);
      });
    },

    // moves object from to newID
    moveObject: function(object, newID, copyFlag){
      var self = this;

      var onSuccess = function(object) {
        self.send('refreshRoute');
      };

      var onFail = function(reason){
        self.send('showActionFail', reason);
      };

      this.store.moveObject(object, newID, copyFlag).then(onSuccess, onFail);

      this.set('toPasteObject', null);
      this.set('copyFlag', false);

    },

    sortBy: function(property){
      this.set("sortProperties", [property]);
      this.toggleProperty("sortAscending");
    },

    refresh: function(){
      this.set('sortProperties', ['is_file', 'stripped_name']);
      this.set('sortAscending', true);
      this.get('model').map(function(el){
        return el.set('isSelected', false);
      });
      this.set('toPasteObject', null);
      this.send('refreshRoute');
    },

    deleteObjects: function(object_list){
      var self = this;
      var selected = this.get('selected');
      var objects = object_list || selected;
      if (objects.length === 0) { return; }
      var onSuccess = function() {
          console.log('delete object: onSuccess');
      };

      var onFail = function(reason){
        self.send('showActionFail', reason);
      };
      
      objects.forEach(function(object) {
        object.deleteRecord();
        object.save().then(onSuccess, onFail);
      });
    },
 
    moveObjectsToTrash: function(object_list){
      var self = this;
      var selected = this.get('selected');
      var objects = object_list || selected;
      if (objects.length === 0) { return; }
      var onSuccess = function() {
          console.log('move to trash object: onSuccess');
      };

      var onFail = function(reason){
        self.send('showActionFail', reason);
      };

      objects.forEach(function(object) {
        var newID = 'trash/'+object.get('stripped_name');
        self.send('_move', object, newID);
      });
    },

    restoreObjectsFromTrash: function(object_list, params){
      var self = this;
      var selected = this.get('selected');
      var objects = object_list || selected;
      var selectedDir = params.selectedDir;
      if (objects.length === 0) { return; }
      var onSuccess = function() {
          console.log('restore from trash object: onSuccess');
      };

      var onFail = function(reason){
        self.send('showActionFail', reason);
      };

      objects.forEach(function(object) {
        var newID = selectedDir + '/' + object.get('stripped_name');
        self.send('_move', object, newID);
      });
    },

  }

});
