import Ember from 'ember';

export default Ember.Component.extend({
  
  inputName: 'file',

  _initInput: function() {
    var name = this.get("inputName");
    this.input = this.$("<input type='file' name='" + name +"' style='display: none'/>");
    this.input.attr("multiple", this.get("multiple"));
    this.$().before(this.input);
    this.input.bind("change", this.handleInputChange.bind(this));
  }.on('didInsertElement'),
  
  handleInputChange: function(e) {
    var files = this.input[0].files;
   
    // no file api support
    if (!files) {
      files = [{'isInput': true, 'input': this.input[0]}];
    }

    for (var i=0; i<files.length; i++) {
      if (this.target) {
        // just in case we are forced to use IFrame transport in a modern 
        // browser
        files[i].input = this.input[0];
        this.target.send("dropFileAdd", 
                         files[i], 
                         this.get("location").replace(/\/$/,""), e, 
                         this.target);
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
