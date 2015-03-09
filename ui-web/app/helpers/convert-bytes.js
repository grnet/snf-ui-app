import Ember from 'ember';
import {bytesToHuman} from '../snf/common';

function convertBytes(bytes) {
  return bytesToHuman(bytes);
}

export {
  convertBytes
};

export default Ember.Handlebars.makeBoundHelper(convertBytes);
