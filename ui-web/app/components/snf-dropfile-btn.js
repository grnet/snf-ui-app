import Ember from 'ember';

export default Ember.Component.extend({

  _initInput: function() {
    this.input = this.$("<input type='file' style='display: none;'/>");
    this.input.attr("multiple", this.get("multiple"));
    this.$().before(this.input);
    this.input.bind("change", this.handleInputChange.bind(this));
  }.on('didInsertElement'),
  
  handleInputChange: function() {
    var files = this.input[0].files;
    for (var i=0; i<files.length; i++) {
      if (this.target) {
        this.target.send("dropFileAdd", files[i], 
                         this.get("location").replace(/\/$/,""));
      }
    }
  },
    
  _setMultiple: function() {
    if (!this.input) { return }
    this.input.attr("multiple", this.get("multiple"));
  }.observes("multiple"),

  click: function(e) {
    if (e.target == this.input[0]) { return true; }
    e.preventDefault();
    var action = this.get("onclick");
    if (action) {
      this.send(action);
    }
  },

  actions: {
    select: function() {
      this.input.click();
    }
  }
});
