import Ember from 'ember';

export default Ember.Component.extend({
  tagName: 'div',
  classNames: ['welcome-box'],
  dismissed: function() {
    var msgs = $.cookie('dismissed-messages');
    if (!msgs) {
      $.cookie('dismissed-messages', '', {expires: 3});
    }
    return msgs || '';
  },

  init_messages: function() { 
    var dismissed = this.dismissed().split(",");
    this.get('messages').forEach(function(msg) {
      msg.visible = true;
      if (dismissed.indexOf(msg.id) > -1) {
        msg.visible = false;
      }
    });
  }.on('init'),

  actions: {
    dismiss: function(msgid) {
      var dismissed = this.dismissed();
      dismissed += "," + msgid;
      $.cookie('dismissed-messages', dismissed, {expires: 3});
      this.$("[data-id=" + msgid + "]").remove();
    }
  }
});
