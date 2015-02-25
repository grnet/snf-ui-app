import Ember from 'ember';

export default Ember.View.extend({
  DragDrop: DropletView.extend({
    /**
     * Accepts a FileList object, and traverses regardless of their mimetype or extension
     *
     * @method traverseFiles
     * @param files {FileList}
     * @return {boolean}
     */
    traverseFiles: function(files) {
      var controller  = Ember.get(this, 'controller');
      for (var index = 0, numFiles = files.length; index < numFiles; index++) {
        if (!files.hasOwnProperty(index) && (!(index in files))) {
            continue;
        }
        var file    = files[index];
        controller.send('addValidFile', file);
      }
      return true;
    },
  })
});
