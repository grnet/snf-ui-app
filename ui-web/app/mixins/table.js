import Ember from 'ember';

export default Ember.Mixin.create({
  tagName: 'table',
  didInsertElement: function() {
    return this.$().attr({ tabindex: 1 }), this.$().focus();
  },
  keyDown: function(e) {
    // check for ctrl+a or cmd+a combination (select all)
    if ( (e.ctrlKey || e.metaKey) && (e.keyCode == 65) ) {
      e.preventDefault();
      console.log('You have tried to select all rows');
    };
  }
});
