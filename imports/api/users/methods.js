Meteor.methods({
	updateUser: function(userId, userProperties) {
		Meteor.users.update(userId, {$set: userProperties});
	},

	pauseUser: function(userId) {
		if (Meteor.users.findOne({_id: userId}).info.role === 'Administrator') {
			throw new Meteor.Error('no-pause-admins', 'Administrators cannot be paused.');
		}
		Meteor.users.update(userId, {$set: {'status.active': false, 'status.updatedOn': new Date()}});
	},

	unpauseUser: function(userId) {
		Meteor.users.update(userId, {$set: {'status.active': true, 'status.updatedOn': new Date()}});
	},

	removeUser: function(userId) {
		if (Meteor.users.findOne({_id: userId}).emails[0].verified) {
			throw new Meteor.Error('no-delete-verified', 'Verified users can be paused but not deleted.');
		}

		Meteor.users.remove(userId);
	}
})