import ObjectPasteController from 'ui-web/controllers/object/paste';
import ResolveSubDirsMixin from 'ui-web/mixins/resolve-sub-dirs';
import NameMixin from 'ui-web/mixins/name';

export default ObjectPasteController.extend(NameMixin, {

  action: 'restoreObjectsFromTrash',
  type: 'restore'

});
