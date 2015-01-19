import Ember from 'ember';

// http://momentjs.com/docs/#/displaying/format/
function timestampToHuman(value) {
  return moment.unix(value).format("YYYY-MM-DD HH:mm");
}

export {
  timestampToHuman
};

export default Ember.Handlebars.makeBoundHelper(timestampToHuman);
