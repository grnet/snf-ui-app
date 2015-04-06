import Ember from 'ember';

export default Ember.Component.extend({
  tagName: 'th',
  classNameBindings: ['cls', 'field:th-sort', 'field'],
  asc: true,

  sortB: function(){
    let sortDir = this.get('asc')?'asc':'desc';
    return this.get('field')+':'+sortDir;
  }.property('asc', 'field'), 


  isSorted: function(){
    return _.contains(this.get('sort'), this.get('field'));
  }.property('sort.@each'),

  click: function(){
    if (this.get('field')) {
      this.toggleProperty('asc');
      console.log(this.get('sortB'));
      this.sendAction('action', this.get('sortB'));
    }
  }
});
