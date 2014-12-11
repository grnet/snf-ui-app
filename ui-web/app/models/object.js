import DS from 'ember-data';

export default DS.Model.extend({
  name: DS.attr('string'),
  bytes: DS.attr('number', {defaultValue: 0}),
  content_type: DS.attr('string'),
  hash: DS.attr('string'),
  public_link: DS.attr('string'),
  sharing: DS.attr('string'),

  is_dir: function(){
    var dirs = ['application/directory', 'application/folder'];
    return (dirs.indexOf(this.get('content_type'))>-1);
  }.property('content_type'),

  stripped_name: function(){
    return this.get('name').split('/').pop();
  }.property('name'),

  shared_users: function(){
    var u_arr = [];
    // model's `sharing` property contains `;` separated pairs of 
    // <permission>=<user-list> where <user-list> is a `,` separated list of 
    // <users> that have sharing permissions with the object
    // <users> = <uuid> | <uuid>:<group_name> | '*' 
    // <permission> = 'read' | 'write'

    // get model's `sharing` property and separate read/write permissions by ;
    this.get('sharing').split(';').forEach(function(p){
      // for each permission, separate permission type and users by =
      var perm = p.split('=');
      // store read/write permission in a variable
      var type = perm[0].trim();
      // split users for each permission
      perm[1].split(',').forEach(function(u){
        var user = {};
        user.type = type;
        user.id = u;
        user.display_name = 'skata';
        // Show display name according to user type (user, group,all)
        if (u === '*') {
          // `*` means all users
          user.display_name = 'All Pithos Users';
        } else if (u.split(':').length>1) {
          // If u contains `:` that means tha it is a group and we will keep
          // only the group's name for the display name
          user.display_name = u.split(':')[1];
        } else {
          // TODO 
          // Handle case when uuid should be translated to user email
          user.display_name = u;
        }
        u_arr.push(user);
      });
    
    });
    return u_arr;
  }.property('sharing'),

});
