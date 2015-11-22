import ObjectPasteController from 'snf-ui/controllers/object/paste';
import ResolveSubDirsMixin from 'snf-ui/mixins/resolve-sub-dirs';
import NameMixin from 'snf-ui/mixins/name';

export default ObjectPasteController.extend(NameMixin, {

  action: 'restoreObjectsFromTrash',
  type: 'restore'

});
