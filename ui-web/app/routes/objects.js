import Ember from 'ember';
import ResetScrollMixin from 'ui-web/mixins/reset-scroll';
import EscapedParamsMixin from 'ui-web/mixins/escaped-params';

export default Ember.Route.extend(EscapedParamsMixin, ResetScrollMixin, {
  escapedParams: ['current_path'],
  model: function(params){
    var parentPath, isEmptyDir, exists;
    var containerID = this.modelFor('container').get('id');
    var containerName = this.modelFor('container').get('name');
    // remove trailing slash from currentPath
    var currentPath = params.current_path ? params.current_path.replace(/\/$/, "") : '/';
    this.store.set('container_id', containerID);
    this.store.set('container_name', containerName);
    this.set('current_path', currentPath);
    var self = this;

    window.scrollTo(0,0);

    return this.store.findQueryReloadable('object', {
      path: currentPath,
      container_id: containerID
    }).then(function(objects) {
      // If the server returns an emtpy array should check if the url is valid.
      if (objects.get('length') === 0) {

        // If it is a container don't check further
        if (currentPath === '/') {
          return objects;
        }

        // If it is not a direct child of a container
        if (currentPath.includes('/')) {

            // remove the last part of the url
            parentPath = currentPath.substring(0, currentPath.lastIndexOf('/'));

            return self.store.findQuery('object', {
              path: parentPath, 
              container_id:containerID
            }).then(function(objList) {
              var ObjListLength = objList.get('length');
              exists = false;
              if(ObjListLength) {
                  objList.forEach(function(object) {
                    var objPath = object.get('path');
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
                  } else {
                    var error = {};
                    error['status'] = 404;
                    self.send('error', error);
                    return undefined;
                  }
              } else {
                // if not existing parent or empty parent dir
                var error = {};
                error['status'] = 404;
                self.send('error', error);
                return undefined;
              }
          });
        } else {
          // If it is direct child of container, check if the container has 
          // any child directories with path the same as the currentPath
          return self.store.findQuery('object', {
            container_id:containerID,
            path: '/'
          }).then(function(objList) {
            isEmptyDir = false;
            objList.forEach(function(object) {
              var objPath = object.get('path');
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
          });
        }
      }
      
      return objects;
    });
  },
  setupController: function(controller,model){
    controller.set('model', model);
    controller.set('container_id', this.store.get('container_id'));
    controller.set('container_name', this.store.get('container_name'));
    controller.set('current_path', this.get('current_path'));
    controller.set('selectedItems', []);
  },

  actions: {
    refreshRoute: function(){
      this.refresh();
    }
  },


});

