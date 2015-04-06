import Ember from 'ember';

export default Ember.Mixin.create({
  templateName: function() {
    debugger;
    var view = 'grid';
    if (this.get('controllerA.view')) {
      view = this.get('controllerA.view');
    }
    return this.get('controllerA.itemName')+'-'+view;
 
  }.property('controllerA.view'),

  viewChanged: function() {
    this.rerender();
  }.observes('controllerA.view'),


});
