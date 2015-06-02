import Ember from 'ember';
import {timeHuman} from 'ui-web/snf/common';

function timeToHumanShort(value) {
  return timeHuman(value, true);
}

export {
  timeToHumanShort
};

export default Ember.Handlebars.makeBoundHelper(timeToHumanShort);
