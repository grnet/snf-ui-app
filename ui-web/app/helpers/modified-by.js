import Ember from 'ember';

export function modifiedBy( current_user_email, modified_by_email) {
  if (current_user_email === modified_by_email){
    return '';
  } else {
    return 'by '+ modified_by_email;
  }
};

export default Ember.Handlebars.makeBoundHelper(modifiedBy);
