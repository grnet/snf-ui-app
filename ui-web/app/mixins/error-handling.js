import Ember from 'ember';

export default Ember.Mixin.create({
	errors: undefined,
	init: function() {
		var self = this;
		this.set('errors', []);

		// Catches js errors
		Ember.onerror = function(error) {
      if(error.stack) {
        if(!error.stack.includes('RSVP')) {
          console.error('[Ember.onerror] Error Report\n', error.message, error.stack);
          self.send('showActionFail', error);
        }
      }
      else {
        self.send('showActionFail', error);
      }
    };

    Ember.RSVP.on('error', function(error) {
      console.error('[Ember.RSVP] Error Report\n', error.status, '\n', error);
      if(error.status !== 0) {
        self.send('showActionFail', error.errorThrown);
      }
    });
	},

	errorRendered: false,

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
		showActionFail: function(error, controller) {
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
			if(!this.get('errorRendered')) {
				this.set('errorRendered', true)
				if(!controller) {
					controller = 'feedback'
				}
				this.refresh();
				this.render('overlays/error', {
					into: 'application',
					outlet: 'errorDialogs',
					controller: controller,
					model: errors,
					view: 'dialog',
				});
			}
		}
	}
});
