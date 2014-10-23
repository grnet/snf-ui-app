import Ember from 'ember';

function timestampToHuman(value) {
  return moment.unix(value).format("YYYY-MM-DD HH:mm");
}

export {
  timestampToHuman
};

export default Ember.Handlebars.makeBoundHelper(timestampToHuman);
