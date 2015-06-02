import ObjectPasteController from 'ui-web/controllers/object/paste';
import ResolveSubDirsMixin from 'ui-web/mixins/resolve-sub-dirs';

export default ObjectPasteController.extend({

  action: 'restoreObjectsFromTrash',
  type: 'restore'

});
