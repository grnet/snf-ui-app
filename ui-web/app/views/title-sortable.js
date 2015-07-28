import Ember from 'ember';

export default Ember.View.extend({
  templateName: 'title-sortable',
  classNames: ['col', 'sortable'],

  title: function(){
    return this.get('field').split('_').join(' ');
  }.property('field'),

  isSorted: function(){
    if (this.get('controller').get('sorting')) {
      return this.get('controller').get('sorting.value').split(':')[0] === this.get('field');
    }
    return false;
  }.property('controller.sorting', 'field'),

  direction: function(){
    if (this.get('isSorted')) {
      return this.get('controller').get('sorting.value').split(':')[1];
    }
  }.property('controller.sorting', 'isSorted'),

  iconCls: function(){
    return (this.get('direction'))? 'fa-sort-'+this.get('direction'): 'fa-sort';
  }.property('direction'),

  click: function(){
    let a = 'asc';
    if (this.get('direction') === 'asc') {
      a = 'desc';
    }
    let f = this.get('field')+':'+a;
    this.get('controller').send('toggleSort', f);
  }

});
