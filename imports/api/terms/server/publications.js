import {Terms} from '../terms.js';

import _ from 'lodash'

Meteor.publish('allTerms', function() {
	if (!this.userId) {
		return this.ready();
	}

	let groupId = Meteor.users.findOne({_id: this.userId}).info.groupId;
	return Terms.find({groupId: groupId}, {sort: {order: 1}, fields: {order: 1, schoolYearId: 1}});
});

Meteor.publish('schoolYearTerms', function(schoolYearId) {
	if (!this.userId) {
		return this.ready();
	}

	let groupId = Meteor.users.findOne({_id: this.userId}).info.groupId;
	return Terms.find({schoolYearId: schoolYearId, groupId: groupId}, {sort: {order: 1}, fields: {order: 1, schoolYearId: 1}});
});




