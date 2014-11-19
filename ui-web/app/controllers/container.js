import Ember from 'ember';

export default Ember.ObjectController.extend({
  itemType: 'container',
  title: 'object controller title',
  needs: ['containers'],
  projects: Ember.computed.alias("controllers.containers.projects"),

  availableProjects: function(){
    var that = this;
    // show only projects whose free space is enough for the container
    return this.get('projects').filter(function(p){
      return that.get('model').get('bytes')< p.get('diskspace');
    });
  }.property('projects.@each', 'model.project'),

  actionToPerform: undefined,

  watchProject: function(){
    var isClean = !this.get('model').get('isDirty');
    var hasSelected = this.get('selectedProject');
    
    if ( isClean && hasSelected)  {
      this.send('reassignContainer', hasSelected.get('id'));
      this.get('model').set('project', hasSelected);
    }
    
  }.observes('selectedProject'),

  selectedProject: function(){
    return this.get('project');
  }.property('model.project'),

  actions: {
    deleteContainer: function(){
      var container = this.get('model');
      var self = this;
      var onSuccess = function(container) {
        console.log('deleteContainer: onSuccess');
      };

      var onFail = function(reason){
        console.log('deleteContainer: onFail', reason);
        self.send('showActionFail', reason)
      };
      container.destroyRecord().then(onSuccess, onFail)
    },

    emptyContainer: function(){
      var container = this.get('model');
      var self = this;
      var onSuccess = function(container) {
        console.log('emptyContainer: onSuccess');
        container.set('count',0);
        container.set('bytes',0);
      };

      var onFail = function(reason){
        console.log('emptyContainer: onFail', reason);
        self.send('showActionFail', reason)
      };
      this.store.emptyContainer(container).then(onSuccess, onFail);
    },

    reassignContainer: function(project_id){
      var container = this.get('model');
      var onSuccess = function(container) {
        console.log('reassignContainer: onSuccess');
      };

      var onFail = function(reason){
        console.log('reassignContainer: onFail', reason);
        self.send('showActionFail', reason)
      };
      this.store.reassignContainer(container, project_id).then(onSuccess, onFail);
    }
  }

});
