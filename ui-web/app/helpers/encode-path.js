import Ember from 'ember';

var encodeURL = function(param) {
  return encodeURIComponent(param).replace(/\%2F/g, '/');
}

export default Ember.Handlebars.makeBoundHelper(encodeURL);
