import Ember from 'ember';

export default Ember.ObjectController.extend({
  title: 'object controller title',


  // TODO:
  // this should not be triggered if the project is deleted
  availableProjects: function(){
    var that = this;
    console.log(this.get('selectedProject'), 'selectedproject');
    return this.store.filter('project',{mode:"member"}, function(p) {
      if (that.get('selectedProject')) {
        return (p.get('id') !== that.get('selectedProject').get('id')) && ( that.get('model').get('bytes')< p.get('diskspace'));
        }
    });
  }.property('selectedProject'),

  selectedProject: function(){
    return this.get('model').get('project');
  }.property('project'),

  watchProject: function(){
    //this.send('reassignContainer');
  }.observes('selectedProject'),

  actions: {
    deleteContainer: function(){
      var container = this.get('model');
      container.deleteRecord();
      container.save();
    },

    emptyContainer: function(){
      var container = this.get('model');
      this.store.emptyContainer(container).then(function(){
        container.set('count',0);
        container.set('bytes',0);
      });


    },

    reassignContainer: function(){
      var container = this.get('model');
      this.store.reassignContainer(container).then(function(res){
        console.log(res, 'res');
      });
    }
  }

});
