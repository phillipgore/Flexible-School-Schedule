import {Subjects} from '../subjects.js';

Meteor.publish('schooYearStudentSubject', function(schoolYearId, studentId) {
	if (!this.userId) {
		return this.ready();
	}

	let groupId = Meteor.users.findOne({_id: this.userId}).info.groupId;	
	return Subjects.find({groupId: groupId, schoolYearId: schoolYearId, studentId: studentId}, {sort: {name: 1}, fields: {name: 1, studentId: 1, schoolYearId: 1}});
});

Meteor.publish('subject', function(subjectId) {
	if (!this.userId || subjectId === 'empty') {
		return this.ready();
	}

	let groupId = Meteor.users.findOne({_id: this.userId}).info.groupId;
	return Subjects.find({_id: subjectId, groupId: groupId}, {fields: {name: 1, studentId: 1, schoolYearId: 1}});
});

Meteor.publish('subjectsView', function(subjectId) {
	if (!this.userId || subjectId === 'empty') {
		return this.ready();
	}

	let groupId = Meteor.users.findOne({_id: this.userId}).info.groupId;
	return Subjects.find({_id: subjectId, groupId: groupId}, {fields: {name: 1, studentId: 1, schoolYearId: 1}});
});