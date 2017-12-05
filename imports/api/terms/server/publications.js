import {Terms} from '../terms.js';

Meteor.publish('schoolYearsTerms', function(schoolYearId) {
	if (!this.userId) {
		return this.ready();
	}

	let groupId = Meteor.users.findOne({_id: this.userId}).info.groupId;
	return Terms.find({groupId: groupId, schoolYearId: schoolYearId}, {sort: {order: 1}});
});