import Ember from 'ember';

// http://momentjs.com/docs/#/displaying/format/
function timestampToHumanShort(value) {
  return moment(value).format("DD-MM-YYYY");
}

export {
  timestampToHumanShort
};

export default Ember.Handlebars.makeBoundHelper(timestampToHumanShort);
