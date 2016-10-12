import Ember from 'ember';
import {RefreshViewMixin} from 'snf-ui/snf/refresh';

export default Ember.View.extend(RefreshViewMixin, {
  templateName: 'my-dir-tree',
});
