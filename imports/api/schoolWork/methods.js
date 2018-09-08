import {Mongo} from 'meteor/mongo';
import SimpleSchema from 'simpl-schema';

import {Students} from '../students/students.js';
import {SchoolYears} from '../schoolYears/schoolYears.js';
import {SchoolWork} from './schoolWork.js';
import {Lessons} from '../lessons/lessons.js';

import _ from 'lodash'

Meteor.methods({
	getInitialSchoolWorkIds() {
		if (!this.userId) {
			return false;
		}

		let groupId = Meteor.users.findOne({_id: this.userId}).info.groupId;
		let ids = {};

		let studentIds = Students.find({groupId: groupId, deletedOn: { $exists: false }}, {sort: {birthday: 1, lastName: 1, 'preferredFirstName.name': 1}}).map((student) => (student._id))
		let schoolYearIds = SchoolYears.find({groupId: groupId, deletedOn: { $exists: false }}, {sort: {startYear: 1}}).map((schoolYear) => (schoolYear._id))
		
		// Initial School Work
		if (studentIds.length && schoolYearIds.length) {
			studentIds.forEach((studentId) => {
				schoolYearIds.forEach((schoolYearId) => {
					let keyName = 'schoolWork' + studentId + schoolYearId;
					let valueSchoolWork = SchoolWork.findOne({groupId: groupId, schoolYearId: schoolYearId, studentId: studentId, deletedOn: { $exists: false }}, {sort: {name: 1}});

					if (valueSchoolWork) {ids[keyName] = valueSchoolWork._id} else {ids[keyName] = 'empty'};
				});
			});
		}

		if (studentIds.length && !schoolYearIds.length) {
			studentIds.forEach((studentId) => {
				let keyName = 'schoolWork' + studentId + 'empty';
				ids[keyName] = 'empty'
			});
		}

		if (!studentIds.length && schoolYearIds.length) {
			schoolYearIds.forEach((schoolYearId) => {
				let keyName = 'schoolWorkempty' + schoolYearId;
				ids[keyName] = 'empty'
			});
		}

		if (!studentIds.length && !schoolYearIds.length) {
			ids.schoolWorkemptyempty = 'empty';
		}

		return ids;
	},

	updateSchoolWork: function(schoolWorkId, schoolWorkProperties) {
		SchoolWork.update(schoolWorkId, {$set: schoolWorkProperties});
		return schoolWorkId;
	},

	deleteSchoolWork: function(schoolWorkId) {
		let lessonIds = Lessons.find({schoolWorkId: schoolWorkId}).map(lesson => (lesson._id));
		
		SchoolWork.update(schoolWorkId, {$set: {deletedOn: new Date()}});
		lessonIds.forEach(function(lessonId) {
			Lessons.update(lessonId, {$set: {deletedOn: new Date()}});
		});
	},

	batchInsertSchoolWork(studentIds, schoolWorkProperties, lessonProperties) {
		newSchoolWork = []
		studentIds.forEach(function(studentId) { 
			schoolWorkProperties.studentId = studentId;
			const schoolWorkId = SchoolWork.insert(schoolWorkProperties);
			newSchoolWork.push({studentId: studentId, schoolWorkId: schoolWorkId});

			lessonProperties.forEach(function(lesson) {
				lesson.schoolWorkId = schoolWorkId;
				Lessons.insert(lesson);
			});
		});

		return newSchoolWork;
	},

	insertSchoolWork(studentIds, schoolWorkProperties, lessonProperties) {
		let groupId = Meteor.user().info.groupId;
		let userId = Meteor.userId();

		let bulkSchoolWork = [];
		let newSchoolWork = [];
		let bulkLessons = [];

		studentIds.forEach(function(studentId) { 
			bulkSchoolWork.push({insertOne: {"document": {
				_id: Random.id(),
				name: schoolWorkProperties.name,
				description: schoolWorkProperties.description,
				resources: schoolWorkProperties.resources,
				studentId: studentId,
				schoolYearId: schoolWorkProperties.schoolYearId,
				groupId: groupId, 
				userId: userId, 
				createdOn: new Date()
			}}});
		});

		let result = SchoolWork.rawCollection().bulkWrite(
			bulkSchoolWork
		).then((schoolWork) => {
			let schoolWorkIds = _.values(schoolWork.insertedIds)
			studentIds.forEach(studentId => {
				SchoolWork.find({_id: {$in: schoolWorkIds}, studentId: studentId}).forEach(schoolWork => {
					newSchoolWork.push({studentId: studentId, schoolWorkId: schoolWork._id});

					lessonProperties.forEach(function(lesson) {
						bulkLessons.push({insertOne: {"document": {
							_id: Random.id(),
							order: lesson.order,
							assigned: false,
							completed: false,
							schoolWorkId: schoolWork._id,
							weekId: lesson.weekId,
							groupId: groupId, 
							userId: userId, 
							createdOn: new Date()
						}}});
					});
				});
			});

			return Lessons.rawCollection().bulkWrite(bulkLessons)
		}).then((schoolWork) => {
			return newSchoolWork;
		}).catch((error) => {
			throw new Meteor.Error(500, error);
		});

		return result;
	},
})