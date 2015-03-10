import Ember from 'ember';

export default Ember.Component.extend({
  tagName: 'ul',
  classNames: ['dir-tree'],
  root: '/',

  actions: {
    select: function(param) {
      this.sendAction('action', param);
    },

    click: function(root, component) {
      this.sendAction('click', root, component);
    }
  }

});
