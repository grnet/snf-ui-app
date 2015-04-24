import Ember from 'ember';

export default Ember.View.extend({
  classNames: ['app'],
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
