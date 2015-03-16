import Ember from 'ember';

export default Ember.Mixin.create({
  resolveSubDirs: function(){
    return function(root){
      if (root === '/'){
        return this.store.find('container');
      } else  {
        var arr = root.split('/');
        var path = '/';
        var container_id = arr.shift();
        if (arr.length>0){
          path = arr.join('/');
        }

        var query = {'path': path, 'container': container_id};

        var objects = this.store.find('object', query).then(function(data){
          return data.filter(function(d){
            return d.get('is_dir');
          }); 
        });

        return DS.PromiseArray.create({promise: objects});
      }
    }.bind(this);
  }.property(),

});
