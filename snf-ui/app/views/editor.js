import {editFile} from 'snf-ui/snf/editor';

export default Ember.View.extend({
  didInsertElement: function() {
    this._super();

    // INITIALIZE EDITOR
    var element, filename, contents;
    element = this.element;
    filename = this.get('model.name');

    // contents = do a pithos API call to retrieve file contents
    contents = '';

    editFile(element, filename, contents);
  },

  willDestroyElement: function() {
    // DESTROY EDITOR, if needed
    this._super();
  }
});
