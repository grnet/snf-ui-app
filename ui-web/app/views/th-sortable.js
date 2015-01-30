import Ember from 'ember';

export default Ember.View.extend({
  templateName: 'th-sortable',
  tagName: 'th',
  classNames: ['th-sort'],
  classNameBindings: ['thAsc', 'thDesc'],

  isSorted: function(){
    return _.contains(this.get('controller').get('sortProperties'), this.get('field'));
  }.property('controller.sortProperties.@each'),

  thAsc: function(){
    return this.get('isSorted') && this.get('controller').get('sortAscending');
  }.property('controller.sortAscending'),

  thDesc: function(){
    return this.get('isSorted') && !this.get('controller').get('sortAscending');
  }.property('controller.sortAscending'),


  title: function(){
    return this.get('field').split('_').join(' ');
  }.property('field'),

  linkTitle: function(){
    return "Sort by "+ this.get('title');
  }.property('title'),
  

  click: function(){
    this.send('sortBy', this.get('field'));
  }
});
