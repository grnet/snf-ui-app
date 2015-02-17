import Ember from 'ember';

export default Ember.ArrayController.extend({
	itemController: 'group',

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

	areUsersValid: function() {
		var allUsersValid = this.get('usersExtended').every(function(user, index) {
			return user.get('status') === 'success';
		});
		if(this.get('usersExtended').get('length')) {
			this.set('allUsersValid', allUsersValid);
		}
		else {
			this.set('allUsersValid', false);
		}

	}.observes('usersExtended.@each'),

	usersExtended: [],
	allUsersValid: false,

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

		updateUser: function(email, data) {

			for(var prop in data) {
				this.get('usersExtended').findBy('email', email).set(prop, data[prop]);
			}

		},

		removeUser: function(email) {

			var user = this.get('usersExtended').findBy('email', email);

			this.get('usersExtended').removeObject(user);

		},

		findUser: function(email) {

			var self = this;
			var userEmail = 'email='+email;

			this.store.find('user', userEmail).then(function(user) {

				var userExtended = self.get('usersExtended').findBy('email', email);

					if(userExtended) {
						self.send('updateUser', email, {uuid: user.get('uuid'), status: 'success'});
					}
		},function(error) {

				var userExtended = self.get('usersExtended').findBy('email', email);

					if(userExtended) {
						self.send('updateUser', email, {uuid: undefined, status: 'error', 'errorMsg': 'Not found'});
					}
			});
		},

		createGroup: function(){

			if(!this.get('freezeCreation')) {

				var self = this;
				var uuids = this.get('usersExtended').mapBy('uuid');
				var name = this.get('newName');
				var groupUsers = self.store.filter('user', function(user) {
					var id = user.get('id');
					if(uuids.indexOf(id) !== -1) {
						return user;
					}
				});

				var group = self.store.createRecord('group', {
					name: name,
					id: name
				});

				group.get('users').then(function(users){
					users.pushObjects(groupUsers);
					group.save();
				});
			}
		}
	}
});
