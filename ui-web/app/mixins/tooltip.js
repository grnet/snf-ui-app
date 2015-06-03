import Ember from 'ember';

var TooltipViewMixin = Ember.Mixin.create({
  initTooltips: function() {
    var self = this;
    this.$().foundation('tooltip');
    this.$().on('DOMNodeInserted', '[data-tooltip]', function() {
      $(this).parent().foundation('tooltip', 'reflow');
    })
  }.on('didInsertElement'),

  removeTooltips: function() {
    this.$().find('.has-tip.open').each(function() {
      var tooltipID = $(this).attr('data-selector');
      $('#' + tooltipID).remove();
    });
  }.on('willDestroyElement')
});

export {TooltipViewMixin};
