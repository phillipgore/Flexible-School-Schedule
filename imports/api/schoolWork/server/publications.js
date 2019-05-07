import {SchoolWork} from '../schoolWork.js';
import {Resources} from '../../resources/resources.js';
import {Students} from '../../students/students.js';
import {SchoolYears} from '../../schoolYears/schoolYears.js';
import {Terms} from '../../terms/terms.js';
import {Weeks} from '../../weeks/weeks.js';
import {Lessons} from '../../lessons/lessons.js';

import _ from 'lodash'

Meteor.publish('schooYearStudentSchoolWork', function(schoolYearId, studentId) {
	if (!this.userId) {
		return this.ready();
	}

	let groupId = Meteor.users.findOne({_id: this.userId}).info.groupId;	
	return SchoolWork.find({groupId: groupId, schoolYearId: schoolYearId, studentId: studentId, deletedOn: { $exists: false }}, {sort: {name: 1}, fields: {order: 1, name: 1, studentId: 1, schoolYearId: 1}});
});

Meteor.publish('trackingViewPub', function(studentId, weekId) {
	this.autorun(function (computation) {
		if (!this.userId) {
			return this.ready();
		}

		let self = this;

		let groupId = Meteor.users.findOne({_id: this.userId}).info.groupId;
		let lessons = Lessons.find({weekId: weekId, deletedOn: { $exists: false }}, {sort: {order: 1}, fields: {groupId: 0, userId: 0, createdOn: 0, updatedOn: 0}}).fetch()
		let schoolWorkIds = lessons.map(lesson => (lesson.schoolWorkId))

		let schoolWorkItems = SchoolWork.find({_id: {$in: schoolWorkIds}, groupId: groupId, studentId: studentId, deletedOn: { $exists: false }}, {sort: {name: 1}, fields: {order: 1, name: 1, studentId: 1, schoolYearId: 1}});

		schoolWorkItems.map((schoolWorkItem) => {
			schoolWorkItem.lessons = _.filter(lessons, ['schoolWorkId', schoolWorkItem._id]);
			self.added('schoolWork', schoolWorkItem._id, schoolWorkItem);
		});

		self.ready();
	});
});

Meteor.publish('schoolWork', function(schoolWorkId) {
	if (!this.userId) {
		return this.ready();
	}

	let groupId = Meteor.users.findOne({_id: this.userId}).info.groupId;
	return SchoolWork.find({groupId: groupId, deletedOn: { $exists: false }, _id: schoolWorkId}, {sort: {name: 1}, fields: {groupId: 0, userId: 0, createdOn: 0, updatedOn: 0, deletedOn: 0}});
});

Meteor.publish('schoolWorkView', function(schoolWorkId) {
	this.autorun(function (computation) {
		if (!this.userId) {
			return this.ready();
		}

		let self = this;

		let groupId = Meteor.users.findOne({_id: this.userId}).info.groupId;
		let schoolWork = SchoolWork.findOne({groupId: groupId, deletedOn: { $exists: false }, _id: schoolWorkId}, {sort: {name: 1}, fields: {groupId: 0, userId: 0, createdOn: 0, updatedOn: 0, deletedOn: 0}});

		if (schoolWork) {
			let student = Students.findOne({groupId: groupId, deletedOn: { $exists: false }, _id: schoolWork.studentId});
			let schoolYear = SchoolYears.findOne({groupId: groupId, deletedOn: { $exists: false }, _id: schoolWork.schoolYearId});
			let terms = Terms.find({groupId: groupId, deletedOn: { $exists: false }, schoolYearId: schoolWork.schoolYearId});
			let resources = Resources.find({groupId: groupId, deletedOn: { $exists: false }, _id: {$in: schoolWork.resources}});

			let termStats = []
			terms.forEach((term) => {
				let weekIds = Weeks.find({groupId: groupId, deletedOn: { $exists: false }, termId: term._id}).map((week) => (week._id));
				let lessonCount = Lessons.find({schoolWorkId: schoolWorkId, weekId: {$in: weekIds}}).count();
				termStats.push({termOrder: term.order, lessonCount: lessonCount});
			})

			schoolWork.preferredFirstName = student.preferredFirstName.name;
			schoolWork.lastName = student.lastName;
			schoolWork.startYear = schoolYear.startYear;
			schoolWork.endYear = schoolYear.endYear;
			schoolWork.termStats = termStats;

			self.added('schoolWork', schoolWork._id, schoolWork);
			resources.map((resource) => {;
				self.added('resources', resource._id, resource);
			});
		}

		self.ready();
	});
});

Meteor.publish('schoolWorkResources', function(schoolWorkId) {	
	if ( schoolWorkId ) {
		let groupId = Meteor.users.findOne({_id: this.userId}).info.groupId;
		let schoolWork = SchoolWork.findOne({groupId: groupId, deletedOn: { $exists: false }, _id: schoolWorkId});
		let resources = Resources.find({groupId: groupId, deletedOn: { $exists: false }, _id: {$in: schoolWork.resources}});

		return resources
	}
	return this.ready();
});
