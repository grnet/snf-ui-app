import Ember from 'ember';

export default Ember.Component.extend({
  tagName: 'ul',
  classNames: ['breadcrumbs'],
  hasDirs: function(){
    return this.get('dirs').length
  }.property('dirs'),

  cnt: function(){
    var num = this.get('objects_count');
    return '('+num+' object'+((num===1)?'':'s')+')';
  }.property('objects_count'),
  
  dirs: function(){
    var dirs = [];
    if (this.get('current_path') == undefined ) {
      return dirs;
    }
    if (this.get('current_path') === '/') {
      return dirs;
    }
    var path_arr = this.get('current_path').split('/');
    while (path_arr.length>0) {
      var dir = {};
      dir.name = _.last(path_arr);
      dir.path = path_arr.join('/');
      dir.current = false;
      dirs.addObject(dir);
      path_arr.pop();
    }
    _.first(dirs).current = true;

    return dirs.reverse();
  }.property('current_path')

});
