import {SchoolYears} from '../schoolYears.js';
import {Stats} from '../../stats/stats.js';
import {Terms} from '../../terms/terms.js';
import {Weeks} from '../../weeks/weeks.js';

import _ from 'lodash'

Meteor.publish('schoolYear', function(schoolYearId) {
	if (!this.userId) {
		return this.ready();
	}

	let groupId = Meteor.users.findOne({_id: this.userId}).info.groupId;
	return SchoolYears.find({groupId: groupId, _id: schoolYearId}, {fields: {startYear: 1, endYear: 1}});
});

Meteor.publish('allSchoolYears', function() {
	if (!this.userId) {
		return this.ready();
	}

	let groupId = Meteor.users.findOne({_id: this.userId}).info.groupId;
	return SchoolYears.find({groupId: groupId}, {sort: {startYear: 1}, fields: {startYear: 1, endYear: 1}});
});

Meteor.publish('schoolYearView', function(schoolYearId) {
	if (!this.userId) {
		return this.ready();
	}

	let groupId = Meteor.users.findOne({_id: this.userId}).info.groupId;
	
	let schoolYear = SchoolYears.find({groupId: groupId, _id: schoolYearId}, {fields: {startYear: 1, endYear: 1}});
	let terms = Terms.find({groupId: groupId, schoolYearId: schoolYearId}, {fields: {order: 1, schoolYearId: 1}});
	let weeks = Weeks.find({groupId: groupId, termId: {$in: terms.map(term => term._id)}}, {fields: {termId: 1}});

	return [schoolYear, terms, weeks];
});

Meteor.publish('schoolYearEdit', function(schoolYearId) {
	if (!this.userId) {
		return this.ready();
	}

	let groupId = Meteor.users.findOne({_id: this.userId}).info.groupId;

	let terms = Terms.find({groupId: groupId, schoolYearId: schoolYearId}, {sort: {order: 1}, fields: {order: 1, schoolYearId: 1}});
	let termIds = terms.map(term => term._id);
	let weeks = Weeks.find({groupId: groupId, termId: {$in: termIds}});
	let weekIds = weeks.map(week => week._id)
	let timeFrameIds = termIds.concat(weekIds)
	let stats = Stats.find({timeFrameId: {$in: timeFrameIds}}, {fields: {timeFrameId: 1, status: 1}});

	return [terms, weeks, stats]
});









