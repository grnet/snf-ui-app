import Ember from 'ember';

export default Ember.View.extend({
  layoutName: 'overlays/alert-box',
  classNames: ['error-box', 'danger-revert'],
  classNameBindings: ['no-display'],
  'no-display': true,

  openBox: function() {
    var self = this;
    this.$().fadeIn(function() {
      self.set('no-display', false);
    });
  }.on('didInsertElement'),

  actions: {
    closeBox: function() {
      var self = this;
      this.$().fadeOut(function() {
        self.set('no-display', true);
        self.get('controller').get('model').set('counter', 0);
        self.get('controller').send('removeErrorBox');
      });
    },
  }

});
