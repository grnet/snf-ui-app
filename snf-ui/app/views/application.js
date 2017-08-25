import Ember from 'ember';
import {RefreshViewMixin} from 'snf-ui/snf/refresh';
import {bindKeyboardShortcuts} from 'snf-ui/snf/common';

export default Ember.View.extend(RefreshViewMixin, {
  classNames: ['app'],
  refreshInterval: Ember.computed.alias('controller.settings.modelRefreshInterval'),
  refreshTasks: ['controller.groups', 'controller.containers', 'controller.projects'],
  
  didInsertElement: function(){
    
    bindKeyboardShortcuts();    

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
