import Ember from 'ember';
/*
* This view is meant to used in forms that will have more then one
* input fields, textareas etc.
* For now, it is used to create group.
* Its main difference from the view.inputSingle is that most of the
* validations and actions are triggered on focusOut or input events.
*/

export default Ember.View.extend({
  classNames: ['input-with-valid', 'input-partial'],
  classNameBindings: ['cls'], // cls is provited by parent the template

  templateName: 'input-partial',
  id: function() {
    return 'input-partial-'+this.get('_uuid');
  }.property(),


  errorVisible: false,
  errorMsg: undefined,
  warningVisible: false,
  warningMsg: undefined,

  /*
  * Errors: empty, already exists
  * Warnings: too large
  */

  value: undefined,

  valueEncoded: function() {
    return encodeURIComponent(this.get('value')).toLowerCase();
  }.property('value'),

  notEmpty: function() {
    var value = this.get('value');
    if(value) {
      value = value.trim();
    }
    else {
      value = null;
    }
    if(value === null) {
      this.set('value', undefined);
      return false;
    }
    else {
      this.set('value', value);
      return true;
    }
  }.property('value'),

  adjustSize: function() {
    var self = this;
    return function() {
      var maxSize = self.get('controller').get('nameMaxLength');
      var valueEncoded = self.get('valueEncoded');
      if(valueEncoded.length >= maxSize) {
        var temp = self.get('value');
        var encodedLength;
        for(var i=0; i<maxSize; i++) {
          temp = temp.slice(0, -1);
          encodedLength = encodeURIComponent(temp).length;
          if(encodedLength <= maxSize) {
            self.send('showInfo','The name of the group must be at the most '+maxSize+' (encoded) characters');
            self.set('value', temp)
            self.send('hideInfo')
            break;
          }
        }
      }
    };
  }.property(),

  toLowerCase: function() {
    var self = this;
    return function() {
      var value = self.get('value');
      var valueLower;
      if(value) {
        valueLower = value.toLowerCase();
      }
      if(value !== valueLower) {
        self.set('value', valueLower);
      }
    }
  }.property(),
  currentErrors: {
    'isUnique': false,
    'hasHyphen': false,
    'hasColon': false
  },

  isUnique: function() {
    var self = this;
    return function() {
      var errors = self.get('currentErrors');
      self.get('controller').set('newName', self.get('value'))
      if(self.get('controller').get('isUnique')) {
        errors.isUnique = false;
      }
      else {
        self.get('controller').set('isNameValid', false);
        errors.isUnique = true;
        self.send('showInfo', 'Already exists', true);
      }
    };
  }.property(),

  hasHyphen: function() {
    var self = this;
    return function() {
      var hasHyphen = false;
      if(self.get('value')) {
        hasHyphen = self.get('value').indexOf('-') !== -1;
      }
      var errors = self.get('currentErrors');
      if(hasHyphen) {
        self.get('controller').set('isNameValid', false);
        errors.hasHyphen = true;
        self.send('showInfo', '"-" is not allowed', true);
      }
      else {
        errors.hasHyphen = false;
      }
    };
  }.property(),

  hasColon: function() {
    var self = this;
    return function() {
      var hasColon = false;
      if(self.get('value')) {
        hasColon = self.get('value').indexOf(':') !== -1;
      }
      var errors = self.get('currentErrors')
      if(hasColon) {
        self.get('controller').set('isNameValid', false);
        errors.hasColon = true;
        self.send('showInfo', '":" is not allowed', true);
      }
      else {
        errors.hasColon = false;
      }
    };
  }.property(),

  handleInput: function() {
    var self = this;

    function closeParentdialog(e) {
      if(e.type === 'keyup') {
        var escKey = 27;
        e.stopPropagation();
        if(e.keyCode == escKey) {
          $('body .close-reveal-modal').trigger('click');
        }
      }
    };

    function checkInputValue(e) {

      // if the browser supports the input event we unbind the keyup
      // handler

      if(e.type === 'input') {
        self.$().off('keyup', 'input' , checkInputValue);
      }
      let value = self.$('input').val();
      console.log('val:', value)
      self.set('value', value);
      if(self.get('notEmpty')) {
        self.get('controller').set('notEmptyName', true);
        Ember.run.debounce(self, function() {
          self.get('toLowerCase')();
          self.get('adjustSize')();
          self.get('hasHyphen')();
          self.get('hasColon')();
          self.get('isUnique')();
        }, 300);
      }
      else {
        self.get('controller').set('isNameValid', false);
        self.get('controller').set('notEmptyName', false);
        let errors = self.get('currentErrors');
        for(var error in errors) {
          errors[error] = false;
        }
        self.send('hideInfo', true);
      }
    }

    function isInputEmpty() {
      if(!self.get('notEmpty')) {
        self.send('showInfo', 'This can\'t be empty.', true);
      }
    };

    this.$('input').on('keyup', closeParentdialog);
    this.$('input').on('input', checkInputValue);
    // use if the browser doesn't support input event
    this.$().on('keyup', 'input', checkInputValue);
    this.$('input').on('input', checkInputValue);
    this.$('input').on('focusout', isInputEmpty);
  }.on('didInsertElement'),

  reset: function() {
    if(this.get('controller').get('resetInputs')) {
      this.set('value', undefined);
      this.set('warningVisible', false);
      this.set('errorVisible', false);
      var resetedInputsNum =  this.get('controller').get('resetedInputs');
      this.get('controller').set('resetedInputs', (this.get('controller').get('resetedInputs') + 1));
    }
  }.observes('controller.resetInputs'),
  actions: {
    showInfo: function(msg, isError) {
      if(isError) {
          this.set('errorMsg', msg);
          this.set('errorVisible', true);
      }
      else {
        this.set('warningMsg', msg);
        this.set('warningVisible', true);
      }
    },
    hideInfo: function(isError) {
      var self = this;
      // Error message should disappear only if there is no kind
      // of error, but should check if we want to hide them on
      // every key press.
      if(isError && this.get('errorVisible')) {
        var errors = this.get('currentErrors');
        var hasError = false;
        for(var error in errors) {
          hasError = hasError || errors[error];
        }
        if(!hasError){
          // all errors have been corrected
          this.set('errorVisible', false);
          if(!self.get('warningVisible')) {
            // enable action if there is no warning either
            self.get('controller').set('isNameValid', true);
          }
        }
      }
      else {
        setTimeout(function() {
          if(self.get('state') === 'inDOM') {
            self.set('warningVisible', false);
            if(!self.get('errorVisible')) {
              self.get('controller').set('isNameValid', true);
            }
          }
        }, 5000);
      }
    }
  }

});
