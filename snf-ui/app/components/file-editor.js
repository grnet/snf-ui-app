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
    readOnly = this.get('readOnly');
 
    if (!readOnly) {
      $(".reveal-modal").attr('data-options', 'close_on_background_click:false;close_on_esc:false');
    }

    var onSave = () => { this.send('save'); }

    // reading file requires http request, thus editor  
    this.set('isLoading', true);
    this.get('model').read().then((contents) => {
      this.set('isLoading', false);
      editFile(editor, filename, contents, readOnly);
    }); 
  },
 
  actions: {
    save() {
      let contents = editor.getValue();
      this.sendAction('onSave', this.get('model'), contents);
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
