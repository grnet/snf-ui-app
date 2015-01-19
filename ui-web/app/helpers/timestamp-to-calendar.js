import Ember from 'ember';

// http://momentjs.com/docs/#/displaying/calendar-time/
function timestampToCalendar(value) {
  return moment(value).calendar();
}

export {
  timestampToCalendar
};

export default Ember.Handlebars.makeBoundHelper(timestampToCalendar);
