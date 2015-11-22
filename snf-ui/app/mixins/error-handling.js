import Ember from 'ember';

export default Ember.Mixin.create({
	errors: undefined,
  netErrorsCount: Ember.Object.create({
    counter: 0
  }),
  errorDialogRendered: false,
	errorBoxRendered: false,
  init: function() {
    var self = this;
    this.set('errors', []);

    // Catches js errors
    Ember.onerror = function(error) {
      if(error.stack) {
        if(!error.stack.includes('RSVP')) {
          console.error('[Ember.onerror] Error Report\n', error.message, error.stack);
          self.send('showErrorDialog', error);
        }
      }
      else {
        self.send('showErrorDialog', error);
      }
    };

    Ember.RSVP.on('error', function(error) {
      console.error('[Ember.RSVP] Error Report\n', error.status, '\n', error);
      if(error.status == 0) {
        self.send('showErrorBox');
      }
      else {
        self.send('showErrorDialog', error.errorThrown);
      }
    });
  },


	actions: {
		/*
		 * when the server returns error and we want full page error msg
		 * we override the action: error
		 */
    error: function(error, transition) {
      console.log('error', error.stack || error);
      switch(error.status) {
        case 404: //not found
          this.render('errors/404', {
            //  we use "into" to keep the header with the nav
            // into: 'application', navigation doesn't work properly
            model: error
          });
          break;
        case 0: //network problem
          break;
        default: // service unavailable
          this.render('errors/503', {
            model: error
          });
          break;
      }
    },

    showErrorBox: function() {
      var netErrorsCount = this.get('netErrorsCount');
      netErrorsCount.set('counter', netErrorsCount.get('counter') + 1);
      var netErrors = Ember.Object.create({
        counter: this.get('netErrorsCount')
      });

      if(!this.get('errorBoxRendered')) {
        this.render('overlays/alert-box', {
          into: 'application',
          outlet: 'alertBox',
          model: netErrorsCount,
          view: 'alertBox',
        });
        this.set('errorBoxRendered', true);
      }
    },

    removeErrorBox: function() {
      this.disconnectOutlet({
        outlet: 'alertBox',
        parentView: 'application'
      });
      this.set('errorBoxRendered', false);
    },

		showErrorDialog: function(error, controller) {
			var timestamp = new Date().toString();
			var errors = this.get('errors');

			// handling of server errors
			if(error.status) {
				let msg = 'message:' + error.status + ' ' + error.statusText + '\n';
				let stack = 'stack:' + error.responseText + '\n';
				let time = 'timestamp:' + timestamp + '\n';
				var error = Ember.Object.create({
					message: error.status + ' ' + error.statusText,
					stack: error.responseText,
					timestamp: timestamp,
					string: time + msg + stack
				});

			}
			// handling of js errors
			else if(error.stack) {
				let msg = 'message:' + error.message + '\n';
				let stack = 'stack:' + error.stack + '\n';
				let time = 'timestamp:' + timestamp + '\n';
				var error = Ember.Object.create({
					message: error.message,
					stack: error.stack,
					timestamp: timestamp,
					string: time + msg + stack
				});
			}
			else if(typeof error === 'object') {
				error['timestamp'] = timestamp;
				var str = '';
				for (var prop in error) {
					str += str + prop + ': ' + error.prop + '\n';
				}
				error['string'] = str;
				console.log('%The error has no stack. But it is an object.\n Do you want to make it ember object?', error.string);
			}
			errors.pushObject(error)
			if(!this.get('errorDialogRendered')) {
				this.set('errorDialogRendered', true)
				if(!controller) {
					controller = 'feedback'
				}
				this.refresh();
				this.render('overlays/error', {
					into: 'application',
					outlet: 'errorDialog',
					controller: controller,
					model: errors,
					view: 'dialog',
				});
			}
		}
	}
});
