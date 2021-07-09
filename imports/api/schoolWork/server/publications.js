import {SchoolWork} from '../schoolWork.js';
import {Resources} from '../../resources/resources.js';
import {Terms} from '../../terms/terms.js';
import {Weeks} from '../../weeks/weeks.js';
import {Notes} from '../../notes/notes.js';
import {Subjects} from '../../subjects/subjects.js';
import {Lessons} from '../../lessons/lessons.js';

import _ from 'lodash'

Meteor.publish('schooYearStudentSchoolWork', function(schoolYearId, studentId) {
	if (!this.userId) {
		return this.ready();
	}

	let groupId = Meteor.users.findOne({_id: this.userId}).info.groupId;	
	return SchoolWork.find({groupId: groupId, schoolYearId: schoolYearId, studentId: studentId}, {sort: {name: 1}, fields: {order: 1, name: 1, studentId: 1, schoolYearId: 1, subjectId: 1}});
});

Meteor.publish('trackingViewPub', function(studentId, schoolYearId, weekId) {
	if (!this.userId) {
		return this.ready();
	}

	let groupId = Meteor.users.findOne({_id: this.userId}).info.groupId;
	let subjects = Subjects.find({studentId: studentId, schoolYearId: schoolYearId})
	let lessons = Lessons.find({studentId: studentId, weekId: weekId}, {sort: {order: 1, weekDay: 1}, fields: {order: 1, completed: 1, assigned: 1, completedOn: 1, studentId: 1, schoolWorkId: 1, weekId: 1, subjectId: 1, weekDay: 1}});
	let schoolWorkIds = lessons.map(lesson => (lesson.schoolWorkId))
	let schoolWork = SchoolWork.find({_id: {$in: schoolWorkIds}, groupId: groupId, studentId: studentId}, {sort: {name: 1}, fields: {order: 1, name: 1, studentId: 1, schoolYearId: 1, subjectId: 1}});
	let notes = Notes.find({weekId: weekId, schoolWorkId: {$in: schoolWorkIds}}, {fields: {schoolWorkId: 1, weekId: 1, note: 1}})
	return [
		subjects,
		lessons,
		schoolWork,
		notes
	]
});

Meteor.publish('trackingEditPub', function(studentId, schoolYearId, weekId) {
	if (!this.userId) {
		return this.ready();
	}


	let groupId = Meteor.users.findOne({_id: this.userId}).info.groupId;
	let weeks = Weeks.find({schoolYearId: schoolYearId}, {sort: {order: 1}, fields: {order: 1, termId: 1}});
	let subjects = Subjects.find({studentId: studentId, schoolYearId: schoolYearId})
	let lessons = Lessons.find({studentId: studentId, weekId: weekId}, {sort: {order: 1, weekDay: 1}, fields: {order: 1, completed: 1, assigned: 1, completedOn: 1, studentId: 1, schoolWorkId: 1, weekId: 1,  subjectId: 1, weekDay: 1}});
	let schoolWorkIds = lessons.map(lesson => (lesson.schoolWorkId))
	let schoolWork = SchoolWork.find({_id: {$in: schoolWorkIds}, groupId: groupId, studentId: studentId}, {sort: {name: 1}, fields: {order: 1, name: 1, studentId: 1, schoolYearId: 1, subjectId: 1}});
	let notes = Notes.find({weekId: weekId, schoolWorkId: {$in: schoolWorkIds}}, {fields: {schoolWorkId: 1, weekId: 1, note: 1}})
	return [
		weeks,
		subjects,
		lessons,
		schoolWork,
		notes
	]
});

Meteor.publish('schoolWork', function(schoolWorkId) {
	if (!this.userId) {
		return this.ready();
	}

	let groupId = Meteor.users.findOne({_id: this.userId}).info.groupId;
	return SchoolWork.find({groupId: groupId, _id: schoolWorkId}, {sort: {name: 1}, fields: {groupId: 0, userId: 0, createdOn: 0, updatedOn: 0}});
});

Meteor.publish('schoolWorkView', function(schoolWorkId) {
	if (!this.userId || schoolWorkId === 'empty') {
		return this.ready();
	}

	let groupId = Meteor.users.findOne({_id: this.userId}).info.groupId;

	let schoolWork = SchoolWork.find({_id: schoolWorkId, groupId: groupId}, {fields: {groupId: 0, userId: 0, createdOn: 0, updatedOn: 0}});
	let terms = Terms.find({groupId: groupId, schoolYearId: schoolWork.fetch()[0].schoolYearId}, {fields: {order: 1, schoolYearId: 1}});
	let lessons = Lessons.find({groupId: groupId, schoolWorkId: schoolWorkId}, {sort: {order: 1, weekDay: 1}, fields: {termId: 1}});
	let resources = Resources.find({groupId: groupId, _id: {$in: schoolWork.fetch()[0].resources}}, {fields: {link: 1, title: 1, type: 1}});

	return [
		schoolWork, 
		terms, 
		lessons,
		resources
	];
});

Meteor.publish('schoolWorkResources', function(schoolWorkId) {
	if (!this.userId) {
		return this.ready();
	}

	if ( schoolWorkId ) {
		let groupId = Meteor.users.findOne({_id: this.userId}).info.groupId;
		let schoolWork = SchoolWork.findOne({groupId: groupId, _id: schoolWorkId});
		let resources = Resources.find({groupId: groupId, _id: {$in: schoolWork.resources}});

		if (resources.count) {
			return resources
		}
		return this.ready();
	}
	return this.ready();
});