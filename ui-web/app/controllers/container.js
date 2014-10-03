import Ember from 'ember';

export default Ember.ObjectController.extend({
  title: 'object controller title',

  availableProjects: function(){
    var that = this;
    return this.store.filter('project',{}, function(p) {
      return p.get('id') != that.get('selectedProject').get('id');
    });
  }.property('selectedProject'),

  selectedProject: function(){
    return this.get('model').get('project');
  }.property('model.project'),

  watchProject: function(){
    console.log('CHANGED', this.get('model'));
    console.log(this.get('selectedProject'));
  }.observes('selectedProject'),

});
