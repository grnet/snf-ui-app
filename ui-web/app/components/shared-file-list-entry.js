import Ember from 'ember';

var alias = Ember.computed.alias;

var DIR_TPL = "<a {{ action 'enter' entry }}>{{ entry.name }}</a>";
var FILE_TPL = "{{ entry.stripped_name }}";

export default Ember.Component.extend({
  isDir: alias('entry.isDir'),

  layout: function() {
    if (this.get('isDir')) {
      return Ember.Handlebars.compile(DIR_TPL);
    }
    return Ember.Handlebars.compile(FILE_TPL);
  }.property('entry'),

  actions: {
    enter: function(entry) {
      this.sendAction('action', entry);
    }
  }
});
