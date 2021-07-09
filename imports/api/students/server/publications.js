import {Students} from '../students.js';

Meteor.publish('allStudents', function() {
	if (!this.userId) {
		return this.ready();
	}

	let groupId = Meteor.users.findOne({_id: this.userId}).info.groupId;
	return Students.find({groupId: groupId}, {sort: {birthday: 1, lastName: 1, 'preferredFirstName.name': 1}, fields: {birthday: 1, lastName: 1, preferredFirstName: 1}});
});

Meteor.publish('student', function(studentId) {
	if (!this.userId) {
		return this.ready();
	}

	let groupId = Meteor.users.findOne({_id: this.userId}).info.groupId;
	return Students.find({groupId: groupId, _id: studentId}, {fields: {firstName: 1, middleName: 1, lastName: 1, nickname: 1, preferredFirstName: 1, birthday: 1}});
});

Meteor.publish('trackingListPub', function(studentId) {
	if (!this.userId) {
		return this.ready();
	}

	let groupId = Meteor.users.findOne({_id: this.userId}).info.groupId;
	return Students.find({groupId: groupId}, {sort: {birthday: 1, lastName: 1, 'preferredFirstName.name': 1}, fields: {birthday: 1, firstName: 1, middleName: 1, lastName: 1, preferredFirstName: 1}});
});









