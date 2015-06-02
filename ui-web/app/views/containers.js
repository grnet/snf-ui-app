import Ember from 'ember';
import {ItemsViewMixin} from 'ui-web/mixins/items'; 
import {RefreshViewMixin} from 'ui-web/snf/refresh';

export default Ember.View.extend(RefreshViewMixin, ItemsViewMixin, {
  refreshTasks: ['controller.model:@controller.settings.modelRefreshInterval'],
  classNames: ['containers']
});
