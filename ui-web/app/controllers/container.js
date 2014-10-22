import Ember from 'ember';

export default Ember.ObjectController.extend({
  title: 'object controller title',


  // TODO:
  // this should not be triggered if the project is deleted
  availableProjects: function(){
    var that = this;
    return this.store.filter('project',{mode:"member"}, function(p) {
      if (that.get('project')) {
        return (p.get('id') !== that.get('project').get('id')) && ( that.get('model').get('bytes')< p.get('diskspace'));
        }
    });
  }.property('project'),

  watchProject: function(){
    var isClean = !this.get('model').get('isDirty');
    var hasSelected = this.get('selectedProject');
    
    if ( isClean && hasSelected)  {
      this.send('reassignContainer', hasSelected.get('id'));
    }
    
  }.observes('selectedProject'),

  selectedProject: function(){
    return this.get('model').get('project');
  }.property('project'),

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

    reassignContainer: function(project_id){
      var container = this.get('model');

      this.store.reassignContainer(container, project_id);
    }
  }

});
