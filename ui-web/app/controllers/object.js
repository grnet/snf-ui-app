import Ember from 'ember';

export default Ember.ObjectController.extend({
  view_src: function(){
    var base_url = this.get('settings').get('storage_view_url');
    var uuid = this.get('settings').get('uuid');
    console.log(this.get('container_id'));
    var container_id = this.get('container_id');
    var name = this.get('model').get('name');
    return base_url+uuid+'/'+container_id+name;
  }.property('model.name'),
});
