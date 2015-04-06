import Ember from 'ember';

export default Ember.Mixin.create({
    usersExtended: undefined,
    allUsersValid: undefined,
    cleanUserInput: undefined,
    init: function() {
        this.set('usersExtended', []);
        this.set('allUsersValid', false);
        this.set('cleanUserInput', true);
        this._super();
    },

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

    }.observes('usersExtended.@each', 'usersExtended.@each.status'),

    freezeCreation: function() {
        var allUsersValid = this.get('allUsersValid');
        var cleanUserInput = this.get('cleanUserInput');

        return !(allUsersValid && cleanUserInput);
    }.property('allUsersValid', 'cleanUserInput'),

    actions: {
        reset: function() {
            this.set('resetInputs', true);
            this.set('usersExtended', []);
        },

        // this is implemented in every controller
        addUser: function() {},

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

        updateUser: function(email, data) {

            for(var prop in data) {
                this.get('usersExtended').findBy('email', email).set(prop, data[prop]);
            }

        },
        removeUser: function(email) {

            var user = this.get('usersExtended').findBy('email', email);

            this.get('usersExtended').removeObject(user);

        },
    }
});
