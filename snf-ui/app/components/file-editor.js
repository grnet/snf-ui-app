import {editFile} from 'snf-ui/snf/editor';
import {showGroupsOnKeyUp} from 'snf-ui/views/application';
import {unbindKeyboardShortcuts, bindKeyboardShortcuts} from 'snf-ui/snf/common';

export default Ember.Component.extend({

  didInsertElement: function() {
    this._super();
   
    // remove the X button 
    $('.close-reveal-modal').remove();
 
    // disable shortcuts
    unbindKeyboardShortcuts();
 
    
    // INITIALIZE EDITOR
    var editor, filename, contents;
    editor = this.$("#file-editor")[0];
    filename = this.get('model.name');
    var readOnly = this.get('readOnly');
    
    this.set('contentChanged', false);

    if (!readOnly) {
      $(".reveal-modal").attr('data-options', 'close_on_background_click:false;close_on_esc:false');
    }

    var onSave = () => { this.send('save'); }
    var onChanged = (changed) => { this.set('contentChanged', changed); }

    // reading file requires http request, thus editor  
    this.set('isLoading', true);
    this.get('model').read().then((contents) => {
      this.set('isLoading', false);
      editFile(editor, filename, contents, readOnly, onSave, onChanged);
    });

  },

  actions: {
    save() {
      if (this.get('contentChanged')) {
        let contents = editor.getValue();
        this.sendAction('onSave', this.get('model'), contents, function(errorOccured, errorType){
          if (errorOccured === false) {
            $("#statusBar").text("saved");
          } else {
            $("#statusBar").text("An error " + errorType + " occured.");
          }
        });
      } else {
        $("#statusBar").text("No changes have been made!");
      }
    },
    cancel() {
      if (this.get('contentChanged')) {
        if (confirm('There are unsaved changes. Are you sure you want to exit')) {
           this.sendAction('onCancel');
        }
      } else {
        this.sendAction('onCancel');
      }
    },
  },


  willDestroyElement: function() {
    // DESTROY EDITOR, if needed
    this._super();
    // bind shortcuts
    bindKeyboardShortcuts();
  }

});
