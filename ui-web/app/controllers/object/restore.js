import ObjectPasteController from '../object/paste';
import ResolveSubDirsMixin from '../../mixins/resolve-sub-dirs';

export default ObjectPasteController.extend({

  action: 'restoreObjectsFromTrash',
  type: 'restore'

});
