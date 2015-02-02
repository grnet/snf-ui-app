import Ember from 'ember';
import SnfDropletController from '../lib/droplet';

export default Ember.ArrayController.extend(SnfDropletController, {
  itemController: 'object',
  sortProperties: ['is_file', 'stripped_name'],

  hasUpPath: function(){
    return this.get('current_path') !== '/';
  }.property('current_path'),

  upPath: function(){
    var arr =  this.get('current_path').split('/');
    arr.pop();
    return arr.join('/');
  }.property('current_path'),

  dropletUrl: function(){
    var url =  this.get('settings').get('storage_host')+'/'+this.get('container_id')+'/';
    if (this.get('current_path') !== '/') {
      url = url + this.get('current_path')+ '/';
    }
    return url;
  }.property('current_path'),

  dropletHeaders: function(){
    return {'X-Auth-Token': this.get('settings').get('token'),
              'X-Requested-With': 'XMLHttpRequest'};
  }.property(),

  objectsCount: function(){
    return this.get('length');
  }.property('@each'),

  groups: function(){
    return this.store.find('group');
  }.property(),

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
      var name = this.get('newName')
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
      var id = this.get('newID')

      var object = this.store.createRecord('object', {
        id: id,
        name: name,
        content_type: 'application/directory',
      });

      var onSuccess = function(object) {
        console.log('onSuccess');
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
      this.set('newID', undefined)
    }
  }.observes('validInput'),

  actions: {
    validateCreation: function(action) {
      var flag = 'validationOnProgress';
      this.set('actionToExec', action);
      this.set(flag, true);
    },

    newObj: false,

    pasteObject: function(){
      if (!this.get('toPasteObject')){
        console.log('Nothing has been cut or copied');
        return false;
      }
      var object = this.get('toPasteObject');
      var old_path = '/'+object.get('id');
      var current_path = (this.get('current_path') === '/')? '/': '/'+this.get('current_path')+'/';
      var new_id = this.get('container_id')+current_path+object.get('stripped_name');
      var self = this;
      var copy_flag = this.get('copyFlag');
    

      // If the object exists aready in the copy destination folder, 
      // show a dialog that asks the user if he wants to overwrite the
      // existing object (thus creating a new version of this object)
      // or if he wants to create a copy of the object
      if ( (object.get('id') === new_id ) && copy_flag ) {
        // 'objects' controller requires an array of models
        this.send('showDialog', 'paste', 'object/paste' , object);
        return;
      } 
      this.send('_resumePaste', object, old_path, new_id, copy_flag);
    },
  
    // restarts object paste
    _resumePaste: function(object, old_path, new_id, copy_flag){
      var self = this;
       var onSuccess = function(container) {
        self.send('refreshRoute');
      };

      var onFail = function(reason){
        self.send('showActionFail', reason);
      };
      this.store.moveObject(object, old_path, new_id, copy_flag).then(onSuccess, onFail);

      this.set('toPasteObject', null);
      this.set('copyFlag', false);


    },

    // continues pasting by calling _resumePaste method
    pasteVersion: function(object) {
      var old_path = '/'+object.get('id');
      var current_path = (this.get('current_path') === '/')? '/': '/'+this.get('current_path')+'/';
      var new_id = this.get('container_id')+current_path+object.get('stripped_name');
 
      this.send('_resumePaste', object, old_path, new_id, true);
    },

    // before pasting it will call _objNewCopyId to rename the object
    pasteCopy: function(object) {
      this.send('_objNewCopyId', object, object.get('id'));
    },
     
     // if the object_id already exists, then it is renamed.
     // <old-name>.<extension> is renamed to <old-name>-copy.<extension>
     // <old-name> with no extension is renamed to <old-name>-copy
     // Directory objects with <old-name> are renamed to <old-name>-copy
    _objNewCopyId: function(object, object_id){
      var exists = this.store.hasRecordForId('object', object_id );
      if (exists) {
        if (object.get('is_dir') ) {
          object_id = object_id + '-copy';
        } else {
          var temp = object_id.split('.');
          var extension = null;
          if (temp.length>1 ) {
            extension = '.'+ temp.pop();
          }
          object_id = temp.join('.')+'-copy';
          if (extension) {
            object_id = object_id + extension;
          }
        }

        this.send('_objNewCopyId', object, object_id);
      } else {
        this.send('_resumePaste', object, '/'+object.get('id'), object_id, true);
      }
    },

    sortBy: function(property){
      this.set("sortProperties", [property]);
      this.toggleProperty("sortAscending");
    },

    selectObjects: function(){
      console.log('item selected');
    },

    refresh: function(){
      this.send('refreshRoute');
    }
  }

});
