import Ember from 'ember';

export default Ember.Component.extend({
  tagName: 'li',
  expanded: false,
  loading: false,

  name: function(){
    var root = this.get('root');
    if (root == '/'){
      return 'My folders';
    } else {
      return root.split('/').pop();
    }
  }.property('root'),

  is_root: function(){
    return this.get('root') == '/';
  }.property('root'),

  is_container: function(){
    return this.get('root').indexOf('/') == -1;
  }.property('root'),

  is_folder: function(){
    return !this.get('is_container') && !this.get('is_root');
  }.property('is_root', 'is_container'),

  container_id: function(){
    return this.get('root').split('/').shift();
  }.property('root'),

  current_path: function(){
    var arr = this.get('root').split('/');
    arr.shift();
    return arr.join('/');
  }.property('root'),

  actions: {
    toggle: function(){
      this.toggleProperty('expanded');
    }
  },

  subdirs: function(){
    if (!this.get('expanded')){
      return [];
    }

    return this.get('resolver')(this.get('root'));
  }.property('root', 'expanded'),


});
