import Ember from 'ember';
import {RefreshViewMixin} from 'ui-web/snf/refresh';

export default Ember.View.extend(RefreshViewMixin, {
  classNames: ['app'],
  refreshInterval: Ember.computed.alias('controller.settings.modelRefreshInterval'),
  refreshTasks: ['controller.groups', 'controller.containers'],
  showUsageOnKeyUp: function() {
    var quotasKey = 85; // "u"
    $(document).keyup(function(e) {
      if(e.keyCode == quotasKey) {
        $('.footer').find('[data-popover-trigger="usage-btn"]').trigger('click');
      }
    });
  }.on('didInsertElement'),

  showGroupsOnKeyUp: function() {
    var self = this;
    var groups = this.get('controller').get('groups');
    var groupKey = 71; // "g"
    $(document).keyup(function(e) {
      if(e.keyCode == groupKey) {
        self.get('controller').send('showDialog', 'groups', 'groups', groups)
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
