import Ember from 'ember';

export default Ember.TextField.extend({
  focusIn: function(event) {
    var selectionEnd = this.$().val().lastIndexOf('.');
    if (selectionEnd<0){
      selectionEnd = this.$().val().length;
    }
    this.$()[0].setSelectionRange(0, selectionEnd);
    this.sendAction('focus-in', this, event);
  }
});
