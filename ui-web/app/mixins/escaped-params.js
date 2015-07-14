import Ember from 'ember';

/*
 * Route mixin which properly decodes route params which are allowed to 
 * contain special url characters (e.g. #, ? etc). To be able to link with 
 * such parameters, both for internal transition but also during initial url 
 * handling, we need to properly encode them during the construction of the 
 * url and decode them right before they are used in the corresponding route 
 * object.
 *
 * The `encode-url` helper can be used to construct escaped urls,
 *
 * {{ link-to 'route-name' (encode-url param1) (encode-url param2) }}
 *
 * The `escaped-params` route mixin can be used for routes which handle 
 * escaped params.
 */
export default Ember.Mixin.create({
  escapedParams: [],

  paramsFor: function(name) {
    var params = this._super(name);
    var transition = this.router.router.activeTransition;
    var state = transition ? transition.state : this.router.router.state;
    var escaped = this.get('escapedParams');
    for (let key in state.params) {
      escaped.forEach(function(param) {
        if (state.params[key][param]) { 
          var _param = decodeURIComponent(state.params[key][param]);
          params[param] = _param;
        }
      });
    }
    return params;
  }
});
