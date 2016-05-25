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
      console.error(error);
      if(error.stack) {
        if(!error.stack.includes('RSVP') && !error.stack.includes('ajaxError')) {
          self.send('showErrorDialog', error);
        }
      }
      else {
        self.send('showErrorDialog', error);
      }
    };

    Ember.RSVP.on('error', function(error) {
      console.error(error);
      if(error.status == 0) {
        self.send('showErrorBox');
      }
      else if (error.errorThrown) {
        self.send('showErrorDialog', error.errorThrown);
      }
      else {
        self.send('showErrorDialog', error);
      }
    });
  },


  actions: {
    /*
     * when the server returns error and we want full page error msg
     * we override the action: error
     */
    error: function(error, transition) {
      console.error(error, transition);
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
			var time = 'timestamp:' + timestamp + '\n';
			var errors = this.get('errors');

			// handling of server errors
			if(error && error.status) {
				let msg = 'message:' + error.status + ' ' + error.statusText + '\n';
				let stack = 'stack:' + error.responseText + '\n';
				var error = Ember.Object.create({
					message: error.status + ' ' + error.statusText,
					stack: error.responseText,
					timestamp: timestamp,
					string: time + msg + stack
				});

			}
			// handling of js errors
			else if(error && error.stack) {
				let msg = 'message:' + error.message + '\n';
				let stack = 'stack:' + error.stack + '\n';
				var error = Ember.Object.create({
					message: error.message,
					stack: error.stack,
					timestamp: timestamp,
					string: time + msg + stack
				});
			}
			else if(typeof error === 'object') {
				let str = '';
				let stack = error.stack;
				for (var prop in error) {
					str += str + prop + ': ' + error[prop] + '\n';
				}
				error['string'] = str;
				var error = Ember.Object.create({
					message: str,
					stack: error.stack,
					timestamp: timestamp,
					string: time + str + stack
				});
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
