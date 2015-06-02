import Ember from 'ember';
import {bytesToHuman} from 'ui-web/snf/common';

function convertBytes(bytes) {
  return bytesToHuman(bytes);
}

export {
  convertBytes
};

export default Ember.Handlebars.makeBoundHelper(convertBytes);
