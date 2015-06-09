import Ember from 'ember';
import FilesListMixin from 'ui-web/mixins/shared-files-list';
import ObjectsController from 'ui-web/controllers/objects';

var alias = Ember.computed.alias;

export default ObjectsController.extend(FilesListMixin, {
  needs: ['account/container'],
  account: alias('controllers.account/container.account'),
  cont: alias('controllers.account/container.cont'),
  rootPath: alias('cont.name'),

  canDelete: false,
  canTrash: false,
  canCopy: true,
  canMove: false,
  canUpload: false,
  canCreate: false,
  canRestore: false,

  parentPath: function() {
    var path = this.get('path');
    if (!path) {
      return false;
    }
  }.property('path')
});
