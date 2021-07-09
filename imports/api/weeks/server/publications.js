import {Weeks} from '../weeks.js';

import _ from 'lodash'

Meteor.publish('allWeeks', function() {
	if (!this.userId) {
		return this.ready();
	}

	let groupId = Meteor.users.findOne({_id: this.userId}).info.groupId;
	return Weeks.find({groupId: groupId}, {sort: {order: 1}, fields: {order: 1, termId: 1, schoolYearId: 1}});
});

Meteor.publish('schoolYearWeeks', function(schoolYearId) {
	if (!this.userId) {
		return this.ready();
	}

	let groupId = Meteor.users.findOne({_id: this.userId}).info.groupId;
	return Weeks.find({schoolYearId: schoolYearId, groupId: groupId}, {fields: {order: 1, termId: 1, schoolYearId: 1}});
});

Meteor.publish('termWeeks', function(termId) {
	if (!this.userId) {
		return this.ready();
	}

	let groupId = Meteor.users.findOne({_id: this.userId}).info.groupId;
	return Weeks.find({termId: termId, groupId: groupId}, {sort: {termOrder: 1, order: 1}, fields: {groupId: 0, userId: 0, createdOn: 0}})
});





