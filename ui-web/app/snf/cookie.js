import Ember from 'ember';

export default Ember.Object.extend({
  setCookie: function(key, value, options) {
    return new Ember.RSVP.Promise(function(resolve, reject) {
      try {
        $.cookie(key, value, options);
        Ember.run(null, resolve);
      } catch(e) {
        Ember.run(null, reject, e);
      }
    });
  },

  getCookie: function(key) {
    return $.cookie(key);
  },

  removeCookie: function(key, options) {
    return $.removeCookie(key, options);
  }
});
