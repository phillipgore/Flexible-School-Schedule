import {Lessons} from '../lessons/lessons.js';

import _ from 'lodash';

Meteor.methods({
	insertWeeks: function(weekProperties) {
		let weekId = Weeks.insert(weekProperties);
		return weekId;
	},

	batchInsertWeeks: function(weekProperties) {
		weekProperties.forEach(function(week) {
			Weeks.insert(week);
		});
	},

	bulkWriteWeeks: function(bulkWeekProperties) {
		Weeks.rawCollection().bulkWrite(bulkWeekProperties);
	},

	checkSpecificWeek: function(weekId, lessonStats) {
		let schoolWorkIds = lessonStats.map(lesson => lesson.schoolWorkId);
		let lessons = Lessons.find({weekId: weekId, schoolWorkId: {$in: schoolWorkIds}}).fetch();
		let newLessonStats = [];
		lessonStats.forEach(lessonStat => {
			let newWeekLessonCount = _.filter(lessons, ['schoolWorkId', lessonStat.schoolWorkId]).length
			let newLessonCount = newWeekLessonCount + lessonStat.lessonCount;
			newLessonStats.push({schoolWorkId: lessonStat.schoolWorkId, lessonCount: newLessonCount, newWeekLessonCount: newWeekLessonCount})
		})
		return newLessonStats;
	},
})