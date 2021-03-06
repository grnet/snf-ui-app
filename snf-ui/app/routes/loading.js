import Ember from 'ember';
import LoadingRoute from 'snf-ui/snf/routes/loading';

export default LoadingRoute.extend({

  setupController: function (controller, model) {
      this._super(controller, model);
      controller.set('msg', 'Loading data');
  }
});
