import Ember from 'ember';
import SnfDropletController from '../lib/droplet';

export default Ember.ArrayController.extend(SnfDropletController, {
  itemController: 'object',

  hasUpPath: function(){
    return this.get('current_path') !== '/';
  }.property('current_path'),

  upPath: function(){
    var arr =  this.get('current_path').split('/');
    arr.pop();
    return arr.join('/');
  }.property('current_path'),

  dropletUrl: function(){
    var url =  this.get('settings').get('storage_host')+'/'+this.get('container_id')+'/';
    if (this.get('current_path') !== '/') {
      url = url + this.get('current_path')+ '/';
    }
    return url;
  }.property('current_path'),

  dropletHeaders: function(){
    return {'X-Auth-Token': this.get('settings').get('token'),
              'X-Requested-With': 'XMLHttpRequest'};
  }.property(),

  actions: {
    createDir: function(){
      var that = this;
      var dir_name = this.get('newDir');
      
      if (!dir_name) { return false; }
      if (!dir_name.trim()) { return; }
      
      var name = dir_name;

      var temp = [];
      temp.push(this.get('container_id'));

      if (this.get('hasUpPath')) {
        temp.push(this.get('current_path'));
      }
      temp.push(name);
      var id = temp.join('/');
      
      var object = this.store.createRecord('object', {
        id: id, 
        name: name,
        content_type: 'application/directory',
      });

      var onsuccess = function(object) {
        that.send('refreshroute');
      };
      
      var onfail = function(reason){
        console.log(reason);
      };

      object.save().then(onsuccess, onfail);
    },
  }

});
