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
      console.log('I am about to delete this container');
      var container = this.get('model');
      console.log('container name', this.get('model').get('name'));
      container.deleteRecord();
      container.save();
    }
  }

});
