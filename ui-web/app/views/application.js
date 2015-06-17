import Ember from 'ember';

export default Ember.View.extend({
  classNames: ['app'],

showUsageOnKeyUp: function() {
  var quotasKey = 85; // "u"
  $(document).keyup(function(e) {
    if(e.keyCode == quotasKey) {
      $('.footer').find('[data-popover-trigger="usage-btn"]').trigger('click');
    }
  });
}.on('didInsertElement'),


  didInsertElement: function(){

    var stickyOffset = $('.sticky').offset().top;

    $(window).scroll(function(){
      var sticky = $('.sticky'),
          scroll = $(window).scrollTop();
            
      if (scroll >= stickyOffset) {
        sticky.addClass('fixed');
      } else {
        sticky.removeClass('fixed');
      }

    });

  },
});
