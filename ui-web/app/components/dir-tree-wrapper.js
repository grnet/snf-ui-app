import Ember from 'ember';

export default Ember.Component.extend({
  tagName: 'ul',
  classNames: ['dir-tree'],

  actions: {
    select: function(param) {
      this.sendAction('action', param);
    }
  }

});
