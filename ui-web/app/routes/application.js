import Ember from 'ember';
import ErrorHandlingMixin from 'ui-web/mixins/error-handling';

export default Ember.Route.extend(ErrorHandlingMixin, {

  activate: function(){
    var theme = this.get('cookie').getCookie('theme') || this.get('settings.main_theme');
    this.initTheme(theme);
    var self = this;
    var uuid = this.get('settings.uuid');
    var containers = this.get('settings.default_containers');

    this.store.findQuery('container', {'account': uuid}).then(function(){
      containers.forEach(function(c){
        if (!(self.store.hasRecordForId('container', uuid +'/'+c))) {
          self.store.find('project', uuid).then(function(p) {
            var container = self.store.createRecord('container', {
              name: c,
              id: uuid + '/' + c,
              project: p,
              versioning: 'auto'
            });
            container.save();
          });
        }
      });
    });
  },

  initTheme: function(theme){
    var el = $("link[data-name='" + theme + "']").first().detach();
    $('head').append(el);
    let loader = _.findWhere(this.get('settings.themes'), {'name': theme})['icon-loader'];
    this.set('settings.icon-loader', loader);
  },

	renderTemplate: function() {
		/*
		* if you define an inner outlet and you don't
		* define and the main template, it will crash
		*/
		this.render("application");
		this.render('overlays/shortcuts', {
			into: 'application',
			outlet: 'overlays/shortcuts',
		});
		this.render('overlays/total-quotas', {
			into: 'application',
			outlet: 'overlays/total-quotas',
		});
    this.render('shared-with-me', {
      into: 'application',
      outlet: 'shared-with-me',
      controller: 'account',
    });
    // this.render('overlays/alert-box', {
    //   into: 'application',
    //   outlet: 'alertBox'
    // });
	},

  setupController: function(controller, model) {
    controller.set('model', model);
    this.store.find('project', controller.settings.get('uuid')).then(function(p) {
      controller.set('systemProject', p);
    });
  },



	actions: {
		/*
		 * when a user clicks a button that shows a modal, triggers the action showModal
		 * in the template:
		 * <a  {{action 'showDialog' <dialogType> <controller> <model> <actionName>}}></a>
		 * if there is no specific action on click there is no need to add actionName
		 * dialogType is the name of the template in the folder overlays
		 */

		showDialog: function(dialogType, controller, model, actionName) {
			var outlet = undefined;
			if(actionName) {
				/* actionToPerform is used in the dialog template:
				 * {{action actionToPerform}}
				 * actionToPerform is the name of the action
				 * that there is in the controller/route
				 */
				controller.set('actionToPerform', actionName);
			}
			if(dialogType === 'feedback') {
				outlet = 'feedback'
				// empty the model of the feedback (could have errors as model)
				var model = Ember.Object.create({});
			}
			else {
				outlet = 'dialog'
			}
			this.render('overlays/'+dialogType, {
				into: 'application',
				outlet: outlet,
				controller: controller,
				model: model,
				view: 'dialog',
			});
		},
		// removeDialog is used for every type of dialog that has rendered
		removeDialog: function(dialogType) {
			// Disconnects a view that has been rendered into an outlet.
			var outlet = undefined;
			if(dialogType) {
				if(dialogType === 'feedback') {
					outlet = 'feedback';
				}
				else if(dialogType === 'error') {
					this.set('errorRendered', false)
					outlet = 'errorDialog';
				}
				else {
					outlet = 'dialog'
				}
				this.disconnectOutlet({
					outlet: outlet,
					parentView: 'application'
				});
			}
			else {
				// if dialogType is undefined disconnect all the dialogs
				this.disconnectOutlet({
					outlet: 'feedback',
					parentView: 'application'
				});

				this.disconnectOutlet({
					outlet: 'errorDialog',
					parentView: 'application'
				});

				this.disconnectOutlet({
					outlet: 'dialog',
					parentView: 'application'
				});

			}
		},
		willTransition: function(transition) {
			this.send('removeDialog');
		},
		sendFeedback: function(msg, data) {
			var self = this;
			var url = this.get('settings').get('account_url')+ '/feedback/';
			var headers = {
				'X-Auth-Token': this.get('settings').get('token'),
	      'X-Requested-With': 'XMLHttpRequest',
	      'Content-Type': 'application/json'
	    };

		// feedback has additional data
	    if(data) {
			var errorFeedback = true;
	    }
	    var data = {
				feedback_msg: msg,
				feedback_data: data
	    };
	    var onSuccess = function(data, textStatus, jqXHR) {
				// send the erros and then remove them from the list
				if(errorFeedback) {
					self.set('errors', []);
				}
	    };

	    var onFail = function(jqXHR, textStatus, error) {
				console.log('feedback error:', textStatus, jqXHR)
				self.send('showErrorDialog', jqXHR);
	    }

	    $.ajax({
				url: url,
				type: 'POST',
				headers: headers,
				dataType: 'text',
				data: data
	    }).then(onSuccess, onFail);
		},
    toggleTheme: function(theme) {
      var cookie = this.get('cookie');
      cookie.setCookie('theme', theme, { expires: 365 });
      this.initTheme(theme);
    }

	}
});
