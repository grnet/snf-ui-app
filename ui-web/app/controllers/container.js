import Ember from 'ember';

export default Ember.ObjectController.extend({
  title: 'object controller title',

  availableProjects: function(){
    var that = this;
    return this.store.filter('project',{mode:"member"}, function(p) {
      if (that.get('selectedProject')){
        return p.get('id') !== that.get('selectedProject').get('id');
      } else {
        return p;
      }

    });
  }.property('selectedProject'),

  selectedProject: function(){
    return this.get('model').get('project');
  }.property('project'),

  watchProject: function(){
    console.log('CHANGED', this.get('model'));
    console.log(this.get('selectedProject'));
  }.observes('selectedProject'),

  actions: {
    deleteContainer: function(){
      var container = this.get('model');
      container.deleteRecord();
      container.save();
    },
    emptyContainer: function(){
      var container = this.get('model');
      container.emptyContainer();
    }
  }

});
