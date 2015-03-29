import Ember from 'ember';

// http://momentjs.com/docs/#/displaying/fromnow/
function timeFromNow(value) {
  return moment(value).fromNow();
}

export {
  timeFromNow
};

export default Ember.Handlebars.makeBoundHelper(timeFromNow);
