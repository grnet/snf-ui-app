import {editFile} from 'snf-ui/snf/editor';

 export default Ember.Component.extend({
 
  didInsertElement: function() {
    this._super();  
    
    // remove the X button 
    $('.close-reveal-modal').remove();
     
    // INITIALIZE EDITOR
    var editor, filename, contents,readOnly;
    editor = this.$("#file-editor")[0];
    filename = this.get('model.name');
    contents = ""; 
    readOnly = this.get('readOnly');
 
    if (!readOnly) {
      $(".reveal-modal").attr('data-options', 'close_on_background_click:false;close_on_esc:false');
    }

    editFile(editor, filename, contents);
 
   },
 
   actions: {
     save() {
       },
     cancel() {
       this.sendAction('onCancel');
     },
   },
 
 
   willDestroyElement: function() {
     // DESTROY EDITOR, if needed
     this._super();
   }
 
 });
