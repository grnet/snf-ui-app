import Ember from 'ember';

export default Ember.Route.extend({
  model: function(){
    return this.store.find('container');
  },
  ajaxSuccess: function(jsonPayload, jqXHR) {
    var ret = this._super(jsonPayload, jqXHR);
    ret.myCustomValue = jqXHR.headers['Server'];
    return ret;
  }
});
