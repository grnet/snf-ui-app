import Ember from 'ember';

export default Ember.Mixin.create({
  resolveSubDirs: function(){
    return function(root){
      if (root === '/'){
        return this.store.find('container');
      } else  {
        var parts = root.split('/');
        var account = parts.shift();
        var container_name = parts.shift();
        var path = '/';
        var container_id = account + '/' + container_name;
        if (parts.length>0){
          path = parts.join('/');
        }
        
        var query = {'path': path, 'container_id': container_id};

        var objects = this.store.findQuery('object', query).then(function(data){
          return data.filter(function(d){
            return d.get('is_dir');
          }); 
        });

        return DS.PromiseArray.create({promise: objects});
      }
    }.bind(this);
  }.property(),

});
