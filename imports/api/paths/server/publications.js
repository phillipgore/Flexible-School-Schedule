import {Paths} from '../../paths/paths.js';
import {SchoolYears} from '../../schoolYears/schoolYears.js';
import {Terms} from '../../terms/terms.js';
import {Weeks} from '../../weeks/weeks.js';

import _ from 'lodash';

Meteor.publish('allPaths', function() {
	if (!this.userId) {
		return this.ready();
	}

	let groupId = Meteor.users.findOne({_id: this.userId}).info.groupId;
	return Paths.find({groupId: groupId});
});
		
Meteor.publish('allSchoolYearPaths', function() {
	if (!this.userId) {
		return this.ready();
	}

	let groupId = Meteor.users.findOne({_id: this.userId}).info.groupId;

	return Paths.find({groupId: groupId, type: 'schoolYear'}, {fields: {groupId: 0, createdOn: 0, updatedOn: 0}});
});

Meteor.publish('schoolYearPaths', function(studentId) {
	if (!this.userId) {
		return this.ready();
	}

	let groupId = Meteor.users.findOne({_id: this.userId}).info.groupId;

	return [
		Paths.find({groupId: groupId, studentId: studentId, type: 'schoolYear'}, {fields: {groupId: 0, createdOn: 0, updatedOn: 0}}),
		SchoolYears.find({groupId: groupId}, {sort: {startYear: 1}, fields: {startYear: 1, endYear: 1}}),
	];
});

Meteor.publish('termPaths', function(studentId, schoolYearId) {
	if (!this.userId) {
		return this.ready();
	}

	let groupId = Meteor.users.findOne({_id: this.userId}).info.groupId;

	return [
		Paths.find({groupId: groupId, studentId: studentId, type: 'term'}, {fields: {groupId: 0, createdOn: 0, updatedOn: 0}}),
		Terms.find({schoolYearId: schoolYearId, groupId: groupId}, {sort: {order: 1}, fields: {order: 1, schoolYearId: 1}}),
	];
});

Meteor.publish('weekPaths', function(studentId, termId) {
	if (!this.userId) {
		return this.ready();
	}

	let groupId = Meteor.users.findOne({_id: this.userId}).info.groupId;

	return Weeks.find({termId: termId, groupId: groupId}, {sort: {termOrder: 1, order: 1}, fields: {groupId: 0, userId: 0, createdOn: 0}});
});




