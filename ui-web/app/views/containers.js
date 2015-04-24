import Ember from 'ember';
import {ItemsViewMixin} from '../mixins/items'; 
import {RefreshViewMixin} from '../snf/refresh';

export default Ember.View.extend(RefreshViewMixin, ItemsViewMixin, {
  refreshTasks: ['controller.model:@controller.settings.modelRefreshInterval'],
  classNames: ['containers']
});
