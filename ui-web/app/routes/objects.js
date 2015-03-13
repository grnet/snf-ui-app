import Ember from 'ember';
import ResetScrollMixin from '../mixins/reset-scroll';

export default Ember.Route.extend(ResetScrollMixin,{
  model: function(params){
    var containerID = this.modelFor('container').get('name');
    var currentPath = params.current_path ? params.current_path : '/';
    this.store.set('container_id', containerID);
    this.set('current_path', currentPath);
    var self = this;

    return this.store.find('object', {
        path: currentPath,
        container_id: containerID
      }).then(function(objects) {

        // When the server returns an emtpy array should check if the url is valid.
        if(objects.get('length') === 0) {
            // if not direct child of container or a container
            if(currentPath.indexOf('/') !== -1 && currentPath !== '/') {

                var parentPath;
                // remove trailing slash
                if(currentPath.lastIndexOf('/') === (currentPath.length - 1)) {
                    currentPath = currentPath.substring(0, currentPath.lastIndexOf('/'))
                }

                // remove the last part of the url
                parentPath = currentPath.substring(0, currentPath.lastIndexOf('/'));
                return self.store.find('object', {
                    path: parentPath, 
                    container_id:containerID
                  }).then(function(objList) {
                    var ObjListLength = objList.get('length');
                    var exists = false;
                    if(ObjListLength) {
                        objList.forEach(function(object) {
                            var objPath = object.get('id');
                            var objIsDir = object.get('is_dir');
                            var index = objPath.indexOf('/') + 1;
                            objPath = objPath.substring(index);
                            if(objPath === currentPath && objIsDir) {
                                exists = true;
                            }
                        });
                        // if parent dir has an object with path = current
                        if(exists) {
                            return objects;
                        }
                        else {
                            var error = {};
                            error['status'] = 404;
                            self.send('error', error);
                            return undefined;
                        }
                    }
                    // if not existing parent or empty parent dir
                    else {
                        var error = {};
                        error['status'] = 404;
                        self.send('error', error);
                        return undefined;
                    }
                });
            }
            //direct child of container (but not a container)
            else if(currentPath !== '/') {
                return self.store.find('object').then(function(objList) {
                    var isEmptyDir = false;
                    objList.forEach(function(object) {
                        var objPath = object.get('id');
                        var objIsDir = object.get('is_dir');
                        var index = objPath.indexOf('/') + 1;
                        objPath = objPath.substring(index);

                        if(objPath === currentPath && objIsDir) {
                          isEmptyDir = true;
                        }
                    });
                    if(!isEmptyDir) {
                    var error = {};
                    error['status'] = 404;
                    self.send('error', error);
                    return undefined;
                    }
                return objects;
                });
            }
        }
        // if there are items
        else {
            return objects;
        }
    });
  },
  setupController: function(controller,model){
    controller.set('model', model);
    var containerID = this.modelFor('container').get('name');
    controller.set('container_id', containerID);
    controller.set('current_path', this.get('current_path'));
    var groups =  this.store.find('group');
    controller.set('groups', groups);
  },
  actions: {
    refreshRoute: function(){
      this.refresh();
    }
  },


});

