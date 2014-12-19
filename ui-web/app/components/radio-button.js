import Ember from 'ember';

export default Ember.Component.extend({
  tagName: 'input',
  type: 'radio',
  attributeBindings: ['type', 'name', "checked:checked", 'value', 'bindValue'],

  checked : function() {
    return this.get("value") === this.get("bindValue");   
  }.property('value', 'bindValue'),

  click : function() {
    this.set("bindValue", this.$().val());
    this.sendAction(undefined, this);
  },

});
