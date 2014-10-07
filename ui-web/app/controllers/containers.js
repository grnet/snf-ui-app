import Ember from 'ember';

export default Ember.ArrayController.extend({
  itemController: 'container',
  projects: function(){
    return this.store.find('project');
  }.property(),
  actions: {
    createContainer: function(){

      var name = this.get('newName');
      var project = this.get('newProject');
      
      if (!name) { return false; }
      if (!name.trim()) { return; }

      // edw to  project erxetai
      var container = this.store.createRecord('container', {
        name: name,
        id: name,
        project: project,
      });

      this.set('newName', '');
      this.set('newProject', '');
      
      var onSuccess = function(container) {
        console.log('onSuccess');
      }
      
      var onFail = function(reason){
        console.log(reason);
      }

      container.save().then(onSuccess, onFail);
    }
  }
});
