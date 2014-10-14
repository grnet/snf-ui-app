import Ember from 'ember';

export default Ember.ObjectController.extend({
  view_src: function(){
    return '/ui/view/'+this.get('settings').get('uuid')+'/pithos/'+this.get('model').get('name');
  }.property('model.name'),
});
