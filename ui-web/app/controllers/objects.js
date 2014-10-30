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

  objectsCount: function(){
    return this.get('length');
  }.property('@each'),

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
        that.send('refreshRoute');
      };
      
      var onfail = function(reason){
        console.log(reason);
      };

      object.save().then(onsuccess, onfail);
    },

    copyFlag: false,

    pasteObject: function(){
      if (!this.get('toPasteObject')){
        console.log('Nothing has been cut or copied');
        return false;
      }
      var object = this.get('toPasteObject');
      var old_path = '/'+object.get('id');
      var current_path = (this.get('current_path') === '/')? '/': '/'+this.get('current_path')+'/';
      var new_id = this.get('container_id')+current_path+object.get('stripped_name');
      var that = this;
      var copy_flag = this.get('copyFlag');

      this.store.moveObject(object, old_path, new_id, copy_flag).then(function(){
        that.send('refreshRoute');
      });
      this.set('toPasteObject', null);
      this.set('copyFlag', false);

    },
    refresh: function(){
      this.send('refreshRoute');
    }
  }

});
