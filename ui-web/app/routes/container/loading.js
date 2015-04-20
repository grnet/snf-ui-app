import Ember from 'ember';
import LoadingRoute from 'ui-web/snf/routes/loading';

export default LoadingRoute.extend({

  setupController: function (controller, model) {
      this._super(controller, model);
      controller.set('msg', 'Loading objects');
  }
});
