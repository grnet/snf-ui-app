export function editFile(element, filename, contents, readOnly) {
  
    var editor = ace.edit(element);

    editor.setOptions({
      // to be just as many lines as code before the max height
      autoScrollEditorIntoView: true,
    });

    // the spaces between lines of data and border
    editor.renderer.setScrollMargin(10, 10, 10, 10);

    // Add the content and set cursor to the first line
    editor.setValue(contents, -1);

    // Syntax highlight
    var modelist = ace.require("ace/ext/modelist");
    var mode = modelist.getModeForPath(filename).mode;
    editor.session.setMode(mode);

    if (readOnly) {
      // preview mode
      editor.setHighlightActiveLine(false);
      editor.setReadOnly(true);
    }
    
    // for debug
    window.editor = editor;
}
  
