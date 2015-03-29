import Ember from 'ember';
import {timestampHuman} from '../snf/common';

// http://momentjs.com/docs/#/displaying/format/
function timestampToHuman(value) {
  return timestampHuman(value);
}

export {
  timestampToHuman
};

export default Ember.Handlebars.makeBoundHelper(timestampToHuman);
