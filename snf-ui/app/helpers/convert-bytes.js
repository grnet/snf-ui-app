import Ember from 'ember';
import {bytesToHuman} from 'snf-ui/snf/common';

function convertBytes(bytes) {
  return bytesToHuman(bytes);
}

export {
  convertBytes
};

export default Ember.Handlebars.makeBoundHelper(convertBytes);
