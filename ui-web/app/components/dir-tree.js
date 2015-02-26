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
