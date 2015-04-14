import Ember from 'ember';

var ItemsControllerMixin = Ember.Mixin.create({
  queryParams: ['view', 'sortBy'],
  closeDialog: false,

  otherView: function(){
    return(this.get('view') == 'list') ? 'grid' : 'list';
  }.property('view'),

  sorting: function(){
    return _.findWhere(this.get('sortFields'), {'value': this.get('sortBy')});
  }.property('sortFields'),

  sortedModel: Ember.computed.sort("model", "sortProperties"),
  
  watchSorting: function(){
      if (this.get('sorting') ) {
        this.set("sortBy", this.get('sorting.value'));
      }
  }.observes('sorting'),

  gridView: function(){
    return this.get('view') == 'grid';
  }.property('view'),

  listView: function(){
    return this.get('view') == 'list';
  }.property('view'),


 
});

var ItemsViewMixin = Ember.Mixin.create({
  tagName: 'ul',
  classNames: ['items'],
  classNameBindings: ['view'],

  view: function(){
    return this.get('controller.view');
  }.property('controller.view'),
  
});

export {ItemsControllerMixin, ItemsViewMixin};
