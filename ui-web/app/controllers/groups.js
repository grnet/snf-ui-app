import Ember from 'ember';
import EmailsInputAuxMixin from '../mixins/emails-input-aux';

export default Ember.ArrayController.extend(EmailsInputAuxMixin, {
	itemController: 'group',
	name: 'groups',

	/*
	* Pithos API allows the name of groups to have at most 256 chars
	* When a new group is created the length of the name is checked
	*/
	nameMaxLength: 256,

	newName: undefined,
	isUnique: undefined,
	cleanUserInput: true,

	isNameValid: function() {
		/*
		* name is valid if it is unique because all other checks
		* have been executed from the input view, before the checkUnique function
		*/
		return this.get('isUnique');
	}.property('isUnique'),


	resetInputs: false,
	resetedInputs: 0,
	completeReset: false,
	checkReset: function() {
		var inputsNum = 2;
		var resetedInputsNum = this.get('resetedInputs');
		if(inputsNum === resetedInputsNum) {
			this.set('resetedInputs', 0);
			this.set('completeReset', true);
		}
		else {
			this.set('completeReset', false);
		}

	}.observes('resetedInputs'),

	// overrides the freezeCreation of EmailsInputAuxMixin
	freezeCreation: function() {

		var isNameValid = this.get('isNameValid');
		var allUsersValid = this.get('allUsersValid');
		var cleanUserInput = this.get('cleanUserInput');

		return !(isNameValid && allUsersValid && cleanUserInput);
	}.property('isNameValid', 'allUsersValid', 'cleanUserInput'),


	checkUnique: function() {
		if(this.get('newName')) {

			var temp = [];
			var name = this.get('newName');

			/*
			* hasRecordForId: Returns true if a record for a given type and ID
			* is already loaded.
			* In our case the id of a container it's its name.
			*/
			var isUnique = !this.get('store').hasRecordForId('group', name);
			this.set('isUnique', isUnique);
		}
	}.observes('newName'),

	actions: {

		addUser: function(user) {

			var usersExtended = this.get('usersExtended');

			if(usersExtended.filterBy('email', user.email).get('length') === 0) {

				var userExtended = Ember.Object.create({
					email: user.email,
					status: user.status,
					errorMsg: user.errorMsg,
				});

				this.get('usersExtended').pushObject(userExtended);

				if(user.status !== 'error') {
					this.send('findUser', user.email);
				}
			}
		},

		createGroup: function(){

			if(!this.get('freezeCreation')) {

				var self = this;
				var uuids = this.get('usersExtended').mapBy('uuid');
				var name = this.get('newName');
				self.store.filter('user', function(user) {
					var id = user.get('id');
					if(uuids.indexOf(id) !== -1) {
						return user;
					}
				}).then(function(groupUsers) {

					var group = self.store.createRecord('group', {
						name: name,
						id: name
					});
					group.get('users').then(function(users){
						groupUsers.forEach(function(user) {
							users.pushObject(user)
						});

						group.save().then(function(){
							self.send('reset');
						}, function(error) {
							self.send('showActionFail', error)
							console.log('ERROR!')
						});
					});
				});
			}
		}
	}
});
