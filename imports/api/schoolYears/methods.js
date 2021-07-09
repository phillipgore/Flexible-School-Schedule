import {SchoolYears} from './schoolYears.js';
import {Paths} from '../../api/paths/paths.js';
import {Stats} from '../../api/stats/stats.js';
import {SchoolWork} from '../schoolWork/schoolWork.js';
import {Terms} from '../terms/terms.js';
import {Weeks} from '../weeks/weeks.js';
import {Lessons} from '../lessons/lessons.js';

import _ from 'lodash'

Meteor.methods({
	insertSchoolYear: function(schoolYearProperties, termProperties) {
		const schoolYearId = SchoolYears.insert(schoolYearProperties, function(error, schoolYearId) {
			if (error) { 
				throw new Meteor.Error(500, error);
			} else {
				termProperties.forEach(function(term) {
					const weeksPerTerm = term.weeksPerTerm;
					term.schoolYearId = schoolYearId;
					delete term.weeksPerTerm;

					Terms.insert(term, function(error, termId) {
						if (error) { 
							throw new Meteor.Error(500, error);
						} else {
							let weekProperties = []
							for (i = 0; i < parseInt(weeksPerTerm); i++) { 
							    weekProperties.push({order: i + 1, schoolYearId: schoolYearId, termId: termId, termOrder: term.order});
							}
							weekProperties.forEach(function(week) {
								Weeks.insert(week);
							});
						}
					});
				})
			}
		});	

		return schoolYearId;
	},

	updateSchoolYear: function(schoolYearId, schoolYearProperties) {
		SchoolYears.update(schoolYearId, {$set: schoolYearProperties});
	},

	deleteSchoolYear: function(schoolYearId) {
		let schoolWorkIds = SchoolWork.find({schoolYearId: schoolYearId}).map(schoolWork => (schoolWork._id))
		let termIds = Terms.find({schoolYearId: schoolYearId}).map(term => (term._id));
		let weekIds = Weeks.find({schoolYearId: schoolYearId}).map(week => (week._id));
		let lessonIds = Lessons.find({schoolYearId: schoolYearId}).map(lesson => (lesson._id));

		// School Year
		SchoolYears.remove({_id: schoolYearId});
		Paths.remove({timeFrameId: schoolYearId});
		Stats.remove({timeFrameId: schoolYearId});

		// School Work
		SchoolWork.remove({_id: {$in: schoolWorkIds}});

		// Terms
		Terms.remove({_id: {$in: termIds}});
		Paths.remove({timeFrameId: {$in: termIds}});
		Stats.remove({timeFrameId: {$in: termIds}});

		// Weeks
		Weeks.remove({_id: {$in: weekIds}});
		Stats.remove({timeFrameId: {$in: weekIds}});

		// Lessons
		Lessons.remove({_id: {$in: lessonIds}});
	},

	updateSchoolYearTerms: function(schoolYearId, schoolYearProperties, termDeleteIds, weekDeleteIds, termUpdateProperties, weekUpdateProperties, termInsertProperties, weekInsertProperties, userId, groupId) {
		let undeletedYearLessons = Lessons.find({schoolYearId: schoolYearId}, {sort: {schoolWorkId: 1, termOrder: 1, weekOrder: 1, order: 1}, fields: {weekId: 1, termId: 1}}).fetch();
		let lessonDeleteIds = [];

		let termBulkDelete = [];
		let weekBulkDelete = [];
		let lessonBulkDelete = [];

		let termBulkUpdate = [];
		let weekBulkUpdate = [];
		let schoolWorkBulkUpdate = [];
		let lessonBulkUpdate = [];

		let termBulkInsert = [];
		let weekBulkInsert = [];


		// Delete Terms
		termDeleteIds.forEach(termId => {
			termBulkDelete.push({deleteOne: {"filter": {_id: termId}}});
		});

		// Delete Weeks
		weekDeleteIds.forEach(weekId => {
			weekBulkDelete.push({deleteOne: {"filter": {_id: weekId}}});
		});

		// Delete Lessons
		_.filter(undeletedYearLessons, lesson => _.includes(weekDeleteIds, lesson.weekId)).forEach(lesson => {
			lessonDeleteIds.push(lesson._id);
			lessonBulkDelete.push({deleteOne: {"filter": {_id: lesson._id}}})
		});



		let yearLessons = Lessons.find({_id: {$nin: lessonDeleteIds}, schoolYearId: schoolYearId}, {sort: {schoolWorkId: 1, termOrder: 1, weekOrder: 1, order: 1}, fields: {weekId: 1, termId: 1, schoolWorkId: 1}}).fetch();

		// Update Terms
		termUpdateProperties.forEach(term => {
			termBulkUpdate.push({updateOne: {"filter": {_id: term._id}, update: {$set: {order: term.order}}}});
			
			// Update Lessons Term Order
			_.filter(yearLessons, ['termId', term._id]).forEach(lesson => {
				lesson.termOrder = term.order;
			});
		});

		// Update Weeks
		weekUpdateProperties.forEach(week => {
			weekBulkUpdate.push({updateOne: {"filter": {_id: week._id}, update: {$set: {order: week.order}}}});
			
			// Update Lessons Week Order
			_.filter(yearLessons, ['weekId', week._id]).forEach(lesson => {
				lesson.weekOrder = week.order;
			});
		});



		let yearSchoolWork = SchoolWork.find({_id: {$in: yearLessons.map(lesson => lesson.schoolWorkId)}}).fetch();

		let yearWeekIds = _.uniq(yearLessons.map(lesson => lesson.weekId));

		// Update School Work
		yearSchoolWork.forEach(schoolWork => {
			if (_.isUndefined(schoolWork.scheduledDays)) {
				let scheduledDays = []; 
				let weekLessonCounts = [];
				yearWeekIds.forEach(function(weekId) {
					weekLessonCounts.push(_.filter(yearLessons, {'schoolWorkId': schoolWork._id, 'weekId': weekId}).length);
				});
				_.uniq(weekLessonCounts).forEach(function(count) {
					if (count) {
						scheduledDays.push({segmentCount: count, days: []})
					}
				})

				schoolWork.scheduledDays = scheduledDays;
				schoolWorkBulkUpdate.push({updateOne: {"filter": {_id: schoolWork._id}, update: {$set: {scheduledDays: scheduledDays}}}})
			}
		});



		let yearTerms = Terms.find({schoolYearId: schoolYearId});

		// Update Lessons
		yearSchoolWork.forEach(schoolWork => {
			let schoolWorkLessons = _.filter(yearLessons, { 'schoolWorkId': schoolWork._id });
			yearTerms.forEach(term => {
				Weeks.find({termId: term._id}).forEach(week => {
					let weeksLessons = _.filter(schoolWorkLessons, { 'weekId': week._id });
					let segmentCount = weeksLessons.length;
					if (segmentCount) {
						if (_.isUndefined(schoolWork.scheduledDays)) {
							let weekDayLabels = schoolWork.scheduledDays.find(dayLabel => parseInt(dayLabel.segmentCount) === segmentCount).days;
							weeksLessons.forEach((lesson, i) => {
								let weekDay = (weekDayLabels) => {
									if (weekDayLabels.length) {
										return parseInt(weekDayLabels[i]);
									}
									return 0;
								}
								if (lesson.weekday >= 0) {
									lesson.weekDay = parseInt(weekDay(weekDayLabels));
								}
							});
						}
					}
				})
			})
		});

		yearLessons.forEach(lesson => {
			lessonBulkUpdate.push({updateOne: {"filter": {_id: lesson._id}, update: {$set: {weekOrder: lesson.weekOrder, termOrder: lesson.termOrder, weekDay: parseInt(lesson.weekDay)}}}});
		});



		// Insert Weeks
		weekInsertProperties.forEach(week => {
			weekBulkInsert.push({insertOne: {"document": {
				_id: Random.id(),
				order: parseInt(week.order),
				termOrder: week.termOrder,
				schoolYearId: schoolYearId,
				termId: week.termId,
				groupId: groupId,
				userId: userId,
				createdOn: new Date()
			}}})
		})

		// Insert Terms
		termInsertProperties.forEach(term => {
			let termId = Random.id();
			termBulkInsert.push({insertOne: {"document": {
				_id: termId,
				order: parseInt(term.order),
				schoolYearId: schoolYearId,
				groupId: groupId,
				userId: userId,
				createdOn: new Date()
			}}})

			// Insert Weeks
			for (i = 0; i < parseInt(term.weeksPerTerm); i++) {
				weekBulkInsert.push({insertOne: {"document": {
					_id: Random.id(),
					order: i + 1,
					termOrder: term.order,
					schoolYearId: schoolYearId,
					termId: termId,
					groupId: groupId,
					userId: userId,
					createdOn: new Date()
				}}})
			}
		})
		
		let termsBulk = termBulkDelete.concat(termBulkUpdate, termBulkInsert);
		let weeksBulk = weekBulkDelete.concat(weekBulkUpdate, weekBulkInsert);
		let lessonsBulk = lessonBulkDelete.concat(lessonBulkUpdate);

		if (termsBulk.length) {
			Terms.rawCollection().bulkWrite(
				termsBulk
			).catch((error) => {
				throw new Meteor.Error(500, error.message);
			});
		}

		if (weeksBulk.length) {
			Weeks.rawCollection().bulkWrite(
				weeksBulk
			).catch((error) => {
				throw new Meteor.Error(500, error.message);
			});
		}

		if (schoolWorkBulkUpdate.length) {
			SchoolWork.rawCollection().bulkWrite(
				schoolWorkBulkUpdate
			).catch((error) => {
				throw new Meteor.Error(500, error.message);
			});
		}

		if (lessonsBulk.length) {	
			Lessons.rawCollection().bulkWrite(
				lessonsBulk
			).catch((error) => {
				throw new Meteor.Error(500, error.message);
			});
		}

		return true;
	},
})