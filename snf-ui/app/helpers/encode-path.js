import Ember from 'ember';

var encodeURL = function(param) {
  return encodeURIComponent(param).replace(/\%2f/gi, '/');
}

export default Ember.Handlebars.makeBoundHelper(encodeURL);
