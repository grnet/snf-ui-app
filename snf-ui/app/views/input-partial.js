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
  * Errors: empty, already exists, has colon, has hypnen
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

  isLarge: function() {
    var maxLength = this.get('controller').get('nameMaxLength');
    var valueEncodedLength = this.get('valueEncoded').length;

    return maxLength < valueEncodedLength;
  }.property('value'),

  /* The function overLimitChars finds how many *decoded* chars
   * should be removed in order the length of the encoded string
   * to be smaller then the max permitted length
  */
  overLimitChars: function() {

    var maxLength = this.get('controller').get('nameMaxLength');
    var valueEncoded = this.get('valueEncoded');
    var valueDecoded = this.get('value');
    var counter = 0;


    if(valueEncoded.length > maxLength) {
      for(let i = 0; i < valueEncoded.length; i++) {
        counter++;
        if(encodeURIComponent(valueDecoded.slice(0, -counter)).length <= maxLength) {
          return counter;
        }
      }

    }
    else {
      return 0;
    }

  }.property('value'),

  manipulateSize: function() {
    var self = this;
    return function() {
      var value = self.get('value');
      var smallerValue;

      if(self.get('isLarge')) {
        smallerValue = value.slice(0, -(self.get('overLimitChars')));
        self.set('value', smallerValue);
        self.send('showInfo','isLarge');
        self.send('hideInfo')
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


  isUnique: function() {
    var self = this;
    return function() {
      if(!self.get('errorVisible')) {
        self.get('controller').set('newName', self.get('value'))
        if(self.get('controller').get('isUnique')) {
        }
        else {
          self.send('showInfo', 'notUnique', true);
        }
      }
    };
  }.property(),

  checkHyphen: function() {
    var self = this;
    return function() {
      if(!self.get('errorVisible')) {
        var hasHyphen = self.get('value').indexOf('-') !== -1;
        if(hasHyphen) {
          self.send('showInfo', 'hasHyphen', true);
        }
      }
    };
  }.property(),

  checkColon: function() {
    var self = this;
    return function() {
      if(!self.get('errorVisible')) {
        var hasHyphen = self.get('value').indexOf(':') !== -1;
        if(hasHyphen) {
          self.send('showInfo', 'hasColon', true);
        }
      }
    };
  }.property(),

  acceptInputValue: function() {
    var self = this;
    return function() {
      if(!self.get('errorVisible')) {
        self.get('controller').set('isNameValid', true);
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
      self.set('value', value);
      if(self.get('notEmpty')) {
        self.get('controller').set('notEmptyName', true);
        Ember.run.debounce(self, function() {
          self.send('hideInfo', true);
          self.get('checkHyphen')();
          self.get('checkColon')();
          self.get('toLowerCase')();
          self.get('manipulateSize')();
          self.get('isUnique')();
          self.get('acceptInputValue')();
        }, 300);
      }
      else {
        self.get('controller').set('isNameValid', false);
        self.get('controller').set('notEmptyName', false);
        self.send('hideInfo', true);
      }
    }

    function isInputEmpty() {
      if(!self.get('notEmpty')) {
        self.send('showInfo', 'isEmpty', true);
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

    showInfo: function(type, isError) {

      /*
      * type can take the values:
      *  - hasHyphen
      *  - hasColon
      *  - isEmpty
      *  - isLarge
      *  - notUnique
      */

      //  TEMP
      var message = {
        hasHyphen: '"-" is not allowed',
        hasColon: '":" is not allowed',
        isEmpty: 'This can\'t be empty.',
        isLarge: 'The name of the group must be at the most ' + this.get('controller').get('nameMaxLength') + ' (encoded) characters',
        notUnique: 'Already exists'
      };


      if(isError) {
        this.set('errorMsg', message[type]);
        this.set('errorVisible', true);
        this.get('controller').set('isNameValid', false);
      }
      else {
        this.set('warningMsg', message[type]);
        this.set('warningVisible', true);
        this.send('hideInfo');
      }
    },

    hideInfo: function(isError) {
      if(isError) {
        this.set('errorVisible', false);
      }
      else if(this.get('warningVisible') === true) {
        var self = this;
        Ember.run.debounce(self, function() {
          if(self.get('_state') === 'inDOM') {
            self.set('warningVisible', false);
          }
        }, 3000);
      }
    },
  }

});
