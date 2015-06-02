import Ember from 'ember';
import {RefreshViewMixin} from 'ui-web/snf/refresh';

export default Ember.View.extend(RefreshViewMixin, {
  refreshTasks: ['controller.containers:@controller.settings.modelRefreshInterval'],
  templateName: 'my-dir-tree',
});
