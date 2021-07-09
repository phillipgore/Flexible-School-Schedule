import {Groups} from '../../../api/groups/groups.js';
import {Students} from '../../../api/students/students.js';
import {SchoolYears} from '../../../api/schoolYears/schoolYears.js';
import {Terms} from '../../../api/terms/terms.js';
import {Weeks} from '../../../api/weeks/weeks.js';
import {Resources} from '../../../api/resources/resources.js';
import {SchoolWork} from '../../../api/schoolWork/schoolWork.js';
import {Lessons} from '../../../api/lessons/lessons.js';

import {primaryInitialIds, resourcesInitialIds, usersInitialId, reportsInitialId, groupsInitialId} from '../../../modules/server/initialIds';
import {upsertPaths, upsertSchoolWorkPaths} from '../../../modules/server/paths';
import {upsertStats} from '../../../modules/server/stats';

Meteor.methods({
	addLessonFixtures() {
		let groupId = Meteor.user().info.groupId;
		let userId = Meteor.userId();

		let studentCount = Students.find({groupId: groupId}, {fields: {_id: 1}}).count();
		let schoolYearCount = SchoolYears.find({groupId: groupId}, {fields: {_id: 1}}).count();
		let schoolWorkCount = SchoolWork.find({groupId: groupId}, {fields: {_id: 1}}).count();

		if (!Groups.findOne({_id: groupId}).appAdmin) {
			throw new Meteor.Error('no-role-app', 'You do not have permission to add test data.');
		}

		if (!studentCount || !schoolYearCount || !schoolWorkCount) {
			throw new Meteor.Error('no-students', 'You must add Students, School Years, Resources and School Work before adding Segments.');
		}

		let fixtureLessons = [];

		// Insert Lessons
		Students.find({groupId: groupId}).forEach(student => {
			SchoolYears.find({groupId: groupId}, {
				sort: {startYear: 1}, 
				fields: {_id: 1}, 
				limit: 2
			}).forEach((schoolYear, schoolYearIndex) => {
				Terms.find({schoolYearId: schoolYear._id}, {
					sort: {order: 1}, 
					fields: {termOrder: 1, order: 1}
				}).forEach(term => {
					let weeks = Weeks.find({termId: term._id}, {sort: {order: 1}, fields: {order: 1, termOrder: 1}}).fetch();
					let schoolWork = SchoolWork.find({studentId: student._id, schoolYearId: schoolYear._id}, {sort: {name: 1}})
				
					weeks.forEach((week, weekIndex) => {
						schoolWork.forEach((schoolWork, schoolWorkIndex) => {
							let randomNumber = Math.floor(Math.random() * (schoolWork.scheduledDays[0].segmentCount + 1) ) + 1
							let randomCompleted = randomNumber < 3 ? randomNumber : 3;

							for (i = 0; i < schoolWork.scheduledDays[0].segmentCount; i++) {
								let lessonProperties = {insertOne: {
									"document": {
										_id: Random.id(),
										order: parseInt(i + 1),
										weekDay: schoolWork.scheduledDays[0].days[i],
										weekOrder: week.order,
										termOrder: week.termOrder,
										assigned: false,
										completed: false,
										schoolWorkId: schoolWork._id,
										schoolYearId: schoolYear._id,
										subjectId: schoolWork.subjectId,
										termId: term._id,
										weekId: week._id,
										studentId: student._id,
										groupId: groupId, 
										userId: userId, 
										createdOn: new Date()
									}	
								}};

								if (schoolYearIndex === 0) {
									lessonProperties.insertOne.document.completed = true
								}

								if (schoolYearIndex === 1 && term.order === 1) {
									lessonProperties.insertOne.document.completed = true
								}

								if (schoolYearIndex === 1 && term.order === 2 && week.order <= 6) {
									lessonProperties.insertOne.document.completed = true
								}

								if (schoolYearIndex === 1 && term.order === 2 && week.order > 6 && lessonProperties.insertOne.document.order < randomCompleted) {
									lessonProperties.insertOne.document.completed = true
								}

								if (schoolYearIndex === 1 && term.order === 2 && week.order > 7) {
									lessonProperties.insertOne.document.completed = false
								}
								fixtureLessons.push(lessonProperties);
							};
						});
					});
				});
			});
		});

		let result = Lessons.rawCollection().bulkWrite(
			fixtureLessons
		).then((result) => {
			Groups.update(groupId, {$set: {'fixtureData.hasLessonData': true}});

			let pathProperties = {
				studentIds: Students.find({groupId: groupId}).map(student => student._id),
				schoolYearIds: SchoolYears.find({groupId: groupId}).map(schoolYear => schoolYear._id),
				termIds: Terms.find({groupId: groupId}).map(term => term._id),
			}

			upsertPaths(pathProperties, false, groupId);
			upsertSchoolWorkPaths(pathProperties, groupId);

			let statProperties = {
				studentIds: Students.find({groupId: groupId}).map(student => student._id),
				schoolYearIds: SchoolYears.find({groupId: groupId}).map(schoolYear => schoolYear._id),
				termIds: Terms.find({groupId: groupId}).map(term => term._id),
				weekIds: Weeks.find({groupId: groupId}).map(week => week._id),
			}
			
			upsertStats(statProperties, groupId);
			primaryInitialIds(groupId);
		}).then((result) => {
			return Groups.findOne({_id: groupId}).initialIds;
		}).catch((error) => {
			throw new Meteor.Error(500, error);
		});

		return result;
	}
});