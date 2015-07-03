import Ember from 'ember';

export default Ember.Mixin.create({
  name_stripped: function() {
    /*
    * The full name of each ember object is formed:
    * <namespace>@<type_of_object>:<name_of_object>::ember<ID>
    * for example: ui-web@controller:objects::ember937
    * We want to extract only the name ("objects")
    */
    console.log(this.toString().split(':')[1]);
    return this.toString().split(':')[1];
  }.property()
});
