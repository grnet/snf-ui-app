import Ember from 'ember';

export default Ember.ObjectController.extend({
  needs: ['objects'],

  container_id: Ember.computed.alias('controllers.objects.container_id'),
  groups: Ember.computed.alias('controllers.objects.groups'),

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
  resetInput: undefined,

  newName: undefined,
  actionToExec: undefined,
  isUnique: undefined,
  oldPath: undefined,
  newID: undefined,
  isImg: function() {
    return this.get('type') === 'image';
  }.property('type'),

  type: function () {
    /*
    * If an object is directory (folder) or file is estimated by
    * mimeType. This info is the is_Dir property of the model.
    *
    * The type of the file, for now, will be estimated by the
    * extension of each file.
    *
    * Possible types:
    * - dir
    * - text
    * - compressed
    * - image
    * - audio
    * - video
    * - pdf
    * - word
    * - excel
    * - powerpoint
    * - unknown
    */
    var isDir = this.get('is_dir');
    var type;

    if(isDir) {
      type = 'dir';
    }
    else {
      var objName = this.get('name');
      var extensionIndex = objName.lastIndexOf('.') + 1;
      var objExtension = objName.substr(extensionIndex).toLowerCase();
      // extensions
      var extTxt = ['txt', 'rtf', 'odt'];
      var extCompress = ['zip', 'tar', 'taz', '7z', 'rar', 'gzip'];
      var extImg = ['bmp', 'gif', 'jpg', 'png', 'jpeg', 'tif', 'svg'];
      var extAudio = ['mp3', 'wma','wav', 'aac', 'm4a'];
      var extVideo = ['mp4', 'mkv', 'flv', 'avi', 'mov', 'qt', 'wmv', 'm4p'];
      var extPDF = ['pdf'];
      var extMSWord = ['doc', 'docx', 'docm'];
      var extMSExcel = ['xls', 'xlsx', 'xla'];
      var extMSPPT = ['ppt', 'pptx'];

      switch(true) {
        case(extTxt.indexOf(objExtension) > -1):
          type = 'text';
          break;
        case(extCompress.indexOf(objExtension) > -1):
          type = 'compressed';
          break;
        case(extImg.indexOf(objExtension) > -1):
          type = 'image';
          break;
        case(extAudio.indexOf(objExtension) > -1):
          type = 'audio';
          break;
        case(extVideo.indexOf(objExtension) > -1):
          type = 'video';
          break;
        case(extPDF.indexOf(objExtension) > -1):
          type = 'pdf';
          break;
        case(extMSWord.indexOf(objExtension) > -1):
          type = 'word';
          break;
        case(extMSExcel.indexOf(objExtension) > -1):
          type = 'excel';
          break;
        case(extMSPPT.indexOf(objExtension) > -1):
          type = 'powerpoint';
          break;
        default:
          type = 'unknown';
      }
    }

    return type;
  }.property('name'),

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
          self.send('refreshRoute');
        };

        var onFail = function(reason){
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
          self.send('refreshRoute');
        };

      var onFail = function(reason){
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

