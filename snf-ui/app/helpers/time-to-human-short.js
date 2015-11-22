import Ember from 'ember';
import {timeHuman} from 'snf-ui/snf/common';

function timeToHumanShort(value) {
  return timeHuman(value, true);
}

export {
  timeToHumanShort
};

export default Ember.Handlebars.makeBoundHelper(timeToHumanShort);
