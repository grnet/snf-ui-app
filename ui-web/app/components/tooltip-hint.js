import Ember from 'ember';

export default Ember.Component.extend({
  tagName: 'span',
  classNames: ['hint--bottom'],
  attributeBindings: ['title:data-hint'],
});
