import DS from 'ember-data';

export default DS.Model.extend({
  name: DS.attr('string'),
  bytes: DS.attr('number', {defaultValue: 0}),
  content_type: DS.attr('string'),
  hash: DS.attr('string'),
  last_modified: DS.attr('string'),
  modified_by: DS.belongsTo('user', {async:true}),
  public_link: DS.attr('string'),
  // model's `sharing` property contains `;` separated pairs of 
  // <permission>=<user-list> where <user-list> is a `,` separated list of 
  // <users> that have sharing permissions with the object
  // <users> = <uuid> | <uuid>:<group_name> | '*' 
  // <permission> = 'read' | 'write'
  sharing: DS.attr('string'),

  extension: function(){
    var name = this.get('name').replace(/^./, '');
    var arr = name.split('.');
    return arr.length>1 ? arr.pop().toLowerCase(): '--';
  }.property('name'),

  // if the object is a directory {{size}} returns null. If it is a file, 
  // it returns the actual size in bytes
  size: function(){
    return this.get('is_dir') ? null: this.get('bytes');
  }.property('bytes'),
  
  is_dir: function(){
    var dirs = ['application/directory', 'application/folder'];
    return (dirs.indexOf(this.get('content_type'))>-1);
  }.property('content_type'),

  is_file: function(){
    return !this.get('is_dir');
  }.property('is_dir'),

  stripped_name: function(){
    return this.get('name').split('/').pop();
  }.property('name'),

  stripped_name_no_ext:function(){
    var stripped_name = this.get('stripped_name').replace(/^./, '');
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
      parts[1].split(',').forEach(function(u){
        var shared = {};
        shared.permission = permission;
        shared.id = u;
        shared.type = 'user';
        // Show display name according to user type (user, group,all)
        if (u === '*') {
          // `*` means all users
          shared.type = 'all';
        } else if (u.split(':').length>1) {
          // If u contains `:` that means that it is a group and we will keep
          // only the group's name for the display name
          shared.type = 'group';
        }
        shared_users.push(shared);
      });
    });
    return shared_users;
  }.property('sharing'),

});

