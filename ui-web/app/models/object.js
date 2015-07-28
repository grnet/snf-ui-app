import DS from 'ember-data';
import {timeHuman} from 'ui-web/snf/common';

UiWeb.Shared = Ember.Object.extend({
  'permission': null,
  'id': null,
  'type': null,
});


export default DS.Model.extend({
  name: DS.attr('string'),
  bytes: DS.attr('number', {defaultValue: 0}),
  content_type: DS.attr('string'),
  hash: DS.attr('string'),
  last_modified: DS.attr('string'),
  modified_by: DS.belongsTo('user', {async:true}),
  allowed_to: DS.attr('string'),

  last_modified_human: function(){
    return timeHuman(this.get('last_modified'));
  }.property('last_modified'),

  shared_by: DS.attr('string'),

  // sharing permissions of ancestor dir
  ancestor_sharing: DS.attr('string'),

  // if the parent dir is shared itself, the shared_by is null
  // but the ancestor_sharing has its permissions
  // if the parent dir has inherit the sharing prop,
  // the shared_by prop has the path of the nearest ancestor the is shared
  shared_ancestor_id: function() {
    var id, shared_by, ancestor_sharing;
    id = this.get('id'),
    shared_by = this.get('shared_by'),
    ancestor_sharing = this.get('ancestor_sharing');

    if(!shared_by && ancestor_sharing) {
      return id.substring(0, id.lastIndexOf('/'))
    } else {
      return shared_by;
    }

  }.property('name', 'shared_by', 'ancestor_sharing'),

  shared_ancestor_path: function() {
    var id = this.get('shared_ancestor_id');
    if (id) {
      var parts = id.split('/');
      parts.shift();
      return parts.join('/');
    }
  }.property('shared_ancestor_id'),

  public_link: DS.attr('string'),
  // model's `sharing` property contains `;` separated pairs of 
  // <permission>=<user-list> where <user-list> is a `,` separated list of 
  // <users> that have sharing permissions with the object
  // <users> = <uuid> | <uuid>:<group_name> | '*' 
  // <permission> = 'read' | 'write'
  sharing: DS.attr('string'),

  extension: function(){
    var name = this.get('name').replace(/^\./, '');
    var arr = name.split('.');
    return arr.length>1 ? arr.pop().toLowerCase(): '--';
  }.property('name'),

  // if the object is a directory {{size}} returns null. If it is a file, 
  // it returns the actual size in bytes
  size: function(){
    return this.get('is_dir') ? null: this.get('bytes');
  }.property('bytes'),
  
  is_dir: function(){
    var dirs = ['application/directory', 'application/folder', 'application/directory; charset=UTF-8'];
    return (dirs.indexOf(this.get('content_type'))>-1);
  }.property('content_type'),

  is_file: function(){
    return !this.get('is_dir');
  }.property('is_dir'),

  path: function(){
    var parts = this.get('id').split('/');
    parts.shift();
    return parts.join('/');
  }.property('id'),

  stripped_name: function(){
    return this.get('name').split('/').pop();
  }.property('name'),

  stripped_name_no_ext:function(){
    var stripped_name = this.get('stripped_name').replace(/^\./, '');
    var arr = stripped_name.split('.');
    if (arr.length>1) {
      arr.pop();
    } 
    if (this.get('stripped_name').charAt(0) == '.') {
      return '.'+arr.join('.');
    }
    return arr.join('.');
  }.property('stripped_name'),

  has_ext: function(){
    return this.get('extension') != '--';
  }.property('extension'),

  // returns a list of items that have permissions to read/write the object
  shared_users: function(){
    var self = this;
    var shared_users = [];

    if (_.isUndefined(this.get('sharing')) || this.get('sharing') === '' || _.isNull(this.get('sharing'))) {
      return shared_users;
    }

    // get model's `sharing` property and separate read/write permissions by ;
    this.get('sharing').split(';').forEach(function(s){
      // for each permission, separate permission type and users by =
      var parts = s.split('=');
      // store read/write permission in a variable
      var permission = parts[0].trim();
      // split  shared users for each permission type
      //

      parts[1].split(',').forEach(function(u){

        var type = 'user';
        // Show display name according to user type (user, group,all)
        if (u === '*') {
          // `*` means all users
          type = 'all';
        } else if (u.split(':').length>1) {
          // If u contains `:` that means that it is a group and we will keep
          // only the group's name for the display name
          type = 'group';
        }
        var shared = UiWeb.Shared.create({
          'permission': permission,
          'id': u,
          'type': type,
          'display_name': null,
        });
        shared_users.pushObject(shared);
      });
    });
    return shared_users;
  }.property('sharing'),

  type: function () {
    /*
    * If an object is directory (folder) or file is estimated by
    * mimeType. This info is the is_Dir property of the model.
    *
    * The type of the file, for now, will be estimated by the
    * extension of each file.
    *
    * Possible types:
    * - folder
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
      type = 'folder';
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
      var extBook = ['mobi', 'epub'];
      var extCSS = ['scss', 'sass', 'css'];

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
        case(extBook.indexOf(objExtension) > -1):
          type = 'ebook';
          break;
        case(extCSS.indexOf(objExtension) > -1):
          type = 'stylesheet';
          break;
        default:
          type = 'unknown';
      }
    }

    return type;
  }.property('name'),



});

