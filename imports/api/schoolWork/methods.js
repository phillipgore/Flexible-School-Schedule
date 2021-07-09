import {Resources} from '../resources/resources.js';
import {SchoolWork} from './schoolWork.js';
import {Lessons} from '../lessons/lessons.js';

import _ from 'lodash'

Meteor.methods({
	getSchoolWorkInfo: function(schoolWorkId) {
		let groupId = Meteor.users.findOne({_id: this.userId}).info.groupId;
		let info = {};
		let resourceInfo = [];

		info.description = SchoolWork.findOne({_id: schoolWorkId, groupId: groupId}).description;

		let resourceIds = _.flattenDeep(SchoolWork.find({_id: schoolWorkId, groupId: groupId}).map(schoolWork => schoolWork.resources));
		let resources = Resources.find({groupId: groupId, _id: {$in: resourceIds}}, {sort: {title: 1}, fields: {title: 1, type: 1, link: 1}});
		resources.forEach(resource => {
			resourceInfo.push({_id: resource._id, title: resource.title, type: resource.type, link: resource.link})
		})

		info.resources = resourceInfo;

		return info;
	},

	updateSchoolWork: function(updateSchoolWorkProperties, removeLessonIds, insertLessonProperties, updateLessonProperties, hasNewSubject) {
		let groupId = Meteor.user().info.groupId;
		let userId = Meteor.userId();

		let schoolWorkId = SchoolWork.update(updateSchoolWorkProperties._id, {$set: updateSchoolWorkProperties});
		let bulkLessons = [];

		if (insertLessonProperties.length) {
			insertLessonProperties.forEach(function(lesson) {
				bulkLessons.push({insertOne: {"document": {
					_id: Random.id(),
					order: parseInt(lesson.order),
					weekDay: parseInt(lesson.weekDay),
					weekOrder: parseInt(lesson.weekOrder),
					termOrder: parseInt(lesson.termOrder),
					assigned: lesson.assigned,
					completed: lesson.completed,
					subjectId: lesson.subjectId,
					schoolWorkId: lesson.schoolWorkId,
					schoolYearId: lesson.schoolYearId,
					termId: lesson.termId,
					weekId: lesson.weekId,
					studentId: lesson.studentId,
					groupId: groupId, 
					userId: userId, 
					createdOn: new Date()
				}}});
			});
		}

		if (updateLessonProperties.length) {
			updateLessonProperties.forEach(lesson => {
				bulkLessons.push({updateOne: 
					{ 
						filter: {_id: lesson._id}, 
						update: {$set: {
							order: parseInt(lesson.order),
							weekDay: parseInt(lesson.weekDay),
						}}, 
					} 
				});
			});
		}

		if (removeLessonIds.length) {
			removeLessonIds.forEach(lessonId => {
				bulkLessons.push({deleteOne: {"filter": {
					_id: lessonId
				}}});
			});
		}

		if (bulkLessons.length) {
			let result = Lessons.rawCollection().bulkWrite(
				bulkLessons
			).then((lessons) => {
				return lessons;
			}).catch((error) => {
				throw new Meteor.Error(500, error);
			});
		}

		if (hasNewSubject) {
			let lessons = Lessons.find({schoolWorkId: updateSchoolWorkProperties._id}, {fields: {_id: 1}});
			let bulkLessonUpdates = []; 

			if (updateSchoolWorkProperties.subjectId) {
				console.log('one');
				lessons.forEach(lesson => {
					bulkLessonUpdates.push({updateOne: 
						{ 
							filter: {_id: lesson._id}, 
							update: {$set: {
								subjectId: updateSchoolWorkProperties.subjectId,
							}}, 
						} 
					});
				});
			} else {
				lessons.forEach(lesson => {
					bulkLessonUpdates.push({updateOne: 
						{ 
							filter: {_id: lesson._id}, 
							update: {$unset: {
								subjectId: "",
							}}, 
						} 
					});
				});
			}

			if (bulkLessonUpdates.length) {
				let result = Lessons.rawCollection().bulkWrite(
					bulkLessonUpdates
				).then((lessons) => {
					return lessons;
				}).catch((error) => {
					throw new Meteor.Error(500, error);
				});
			}
		}
	},

	deleteSchoolWork: function(schoolWorkId) {
		let lessonIds = Lessons.find({schoolWorkId: schoolWorkId}).map(lesson => (lesson._id));

		SchoolWork.remove({_id: schoolWorkId});
		Lessons.remove({_id: {$in: lessonIds}});
	},

	insertSchoolWork(schoolWorkProperties, lessonProperties) {
		const schoolWorkId = SchoolWork.insert(schoolWorkProperties);

		let groupId = Meteor.user().info.groupId;
		let userId = Meteor.userId();
		let bulkLessons = [];
			
		lessonProperties.forEach(function(lesson) {
			bulkLessons.push({insertOne: {"document": {
				_id: Random.id(),
				order: parseInt(lesson.order),
				assigned: false,
				completed: false,
				studentId: lesson.studentId,
				subjectId: lesson.subjectId,
				schoolYearId: lesson.schoolYearId,
				termId: lesson.termId,
				weekId: lesson.weekId,
				schoolWorkId: schoolWorkId,
				termOrder: lesson.termOrder,
				weekOrder: lesson.weekOrder,
				weekDay: parseInt(lesson.weekDay),
				groupId: groupId, 
				userId: userId, 
				createdOn: new Date()
			}}});
		});

		Lessons.rawCollection().bulkWrite(
			bulkLessons
		).then((lessons) => {
			return schoolWorkId;
		}).catch((error) => {
			throw new Meteor.Error(500, error);
		});

		return schoolWorkId;
	},

	updateSchoolWorkSubject: function(schoolWorkProperties) {
		let getSetProperties = (schoolWorkProperties) => {
			if (schoolWorkProperties.subjectId.length) {
				return {$set: {subjectId: schoolWorkProperties.subjectId}}
			}
			return {$unset: {subjectId: ''}}
		}

		let schoolWorkId = SchoolWork.update(schoolWorkProperties._id, getSetProperties(schoolWorkProperties));

		let lessonIds = Lessons.find({schoolWorkId: schoolWorkProperties._id}, {fields: {_id: 1}}).map(lesson => lesson._id);
		let bulkLessons = [];

		if (lessonIds.length) {
			lessonIds.forEach(lessonId => {
				bulkLessons.push({updateOne: 
					{ 
						filter: {_id: lessonId}, 
						update: getSetProperties(schoolWorkProperties), 
					} 
				});
			});
		}

		if (bulkLessons.length) {
			let result = Lessons.rawCollection().bulkWrite(
				bulkLessons
			).then((lessons) => {
				return lessons;
			}).catch((error) => {
				throw new Meteor.Error(500, error);
			});
		}
	},
});




