import {Stats} from '../../api/stats/stats.js';
import {Groups} from '../../api/groups/groups.js';
import {Students} from '../../api/students/students.js';
import {SchoolYears} from '../../api/schoolYears/schoolYears.js';
import {Terms} from '../../api/terms/terms.js';
import {Weeks} from '../../api/weeks/weeks.js';
import {SchoolWork} from '../../api/schoolWork/schoolWork.js';
import {Lessons} from '../../api/lessons/lessons.js';

import _ from 'lodash';

/* -------------------- Example: statProperties -------------------- */

// let statProperties = {
// 	studentIds: [],
// 	schoolYearIds: [],
// 	termIds:[],
// 	weekIds:[],
// }

/* -------------------- Exported Functions -------------------- */

// Upsert Stats
export function upsertStats(statProperties, submittedGroupId) {
	let groupId = getGroupId(submittedGroupId);

	let studentIds = getStudents(groupId, statProperties);
	let schoolYearIds = getSchoolYears(groupId, statProperties);
	let termIds = getTerms(groupId, schoolYearIds, statProperties);
	let weekIds = getWeeks(groupId, termIds, statProperties);

	if (studentIds.length && schoolYearIds.length) {
		studentIds.forEach(studentId => {
			schoolYearIds.forEach(schoolYearId => {
				upsertSchoolYearStats(groupId, studentId, schoolYearId);
			});

			if (termIds.length) {
				termIds.forEach(termId => {
					upsertTermStats(groupId, studentId, termId);
				});
			}

			if (weekIds.length) {
				weekIds.forEach(weekId => {
					upsertWeekStats(groupId, studentId, weekId);
				});
			}

		});
	}

	return true;
}



/* -------------------- Internal Functions -------------------- */

// Return Students
function getStudents(groupId, statProperties) {
	if (statProperties['studentIds'].length) {
		return statProperties['studentIds']
	}

	let studentIds = Students.find({groupId: groupId}, {fields: {groupId: 1}}).map(student => student._id)
	if (studentIds.length) {
		return studentIds;
	} else {
		return [];
	}
}

// Return School Years
function getSchoolYears(groupId, statProperties) {
	if (statProperties['schoolYearIds'].length) {
		return statProperties['schoolYearIds']
	}

	let schoolYearIds = SchoolYears.find({groupId: groupId}, {fields: {groupId: 1}}).map(schoolYear => schoolYear._id)
	if (schoolYearIds.length) {
		return schoolYearIds;
	} else {
		return [];
	}
}

// Return Terms
function getTerms(groupId, schoolYearIds, statProperties) {
	if (statProperties['termIds'].length) {
		return statProperties['termIds']
	}

	let termIds = Terms.find({groupId: groupId, schoolYearId: {$in: schoolYearIds}}, {fields: {groupId: 1}}).map(term => term._id)
	if (termIds.length) {
		return termIds;
	} else {
		return [];
	}
}

// Return Weeks
function getWeeks(groupId, termIds, statProperties) {
	if (statProperties['weekIds'].length) {
		return statProperties['weekIds']
	}

	let weekIds = Weeks.find({groupId: groupId, termId: {$in: termIds}}, {fields: {groupId: 1}}).map(week => week._id)
	if (weekIds.length) {
		return weekIds;
	} else {
		return [];
	}
}



// Rounding
function rounding(complete, total) {
	if(complete && total) {
		let percentComplete = complete / total * 100
		if (percentComplete > 0 && percentComplete < 1) {
			return 1;
		}
		return Math.floor(percentComplete);
	}
	return 0;
};

// Status
function status (lessonsTotal, lessonsCompletedTotal, lessonsAssignedTotal) {
	if (!lessonsTotal) {
		return 'empty'
	}
	if (!lessonsCompletedTotal && !lessonsAssignedTotal) {
		return 'pending'
	} 
	if (lessonsTotal === lessonsCompletedTotal) {
		return 'completed'
	}
	if (lessonsAssignedTotal) {
		return 'assigned'
	} 
	return 'partial'
};



// School Year Stats Upsert
function upsertSchoolYearStats(groupId, studentId, schoolWorkId) {
	let schoolYearLessons = Lessons.find({studentId: studentId, schoolYearId: schoolWorkId, groupId: groupId}, {fields: {completed: 1, assigned: 1}}).fetch();
	let stats = {};

	stats.lessonCount = schoolYearLessons.length;
	stats.completedLessonCount = _.filter(schoolYearLessons, {'completed': true}).length;
	stats.assignedLessonCount = _.filter(schoolYearLessons, {'completed': false, 'assigned': true}).length;
	stats.completedLessonPercentage = rounding(stats.completedLessonCount, stats.lessonCount);
	stats.status = status(stats.lessonCount, stats.completedLessonCount, stats.assignedLessonCount);
	stats.groupId = groupId;
	stats.createdOn = new Date();

	Stats.update({studentId: studentId, timeFrameId: schoolWorkId, type: 'schoolYear'}, {$set: stats}, {upsert: true});
};

// Terms Stats Upsert
function upsertTermStats(groupId, studentId, termId) {
	let termLessons = Lessons.find({studentId: studentId, termId: termId, groupId: groupId}, {fields: {completed: 1, assigned: 1}}).fetch();
	let stats = {};

	stats.lessonCount = termLessons.length;
	stats.completedLessonCount = _.filter(termLessons, {'completed': true}).length;
	stats.assignedLessonCount = _.filter(termLessons, {'completed': false, 'assigned': true}).length;
	stats.completedLessonPercentage = rounding(stats.completedLessonCount, stats.lessonCount);
	stats.status = status(stats.lessonCount, stats.completedLessonCount, stats.assignedLessonCount);
	stats.groupId = groupId;
	stats.createdOn = new Date();

	Stats.update({studentId: studentId, timeFrameId: termId, type: 'term'}, {$set: stats}, {upsert: true});
};

// Weeks Stats Upsert
function upsertWeekStats(groupId, studentId, weekId) {
	let weekLessons = Lessons.find({studentId: studentId, weekId: weekId, groupId: groupId}, {fields: {completed: 1, assigned: 1}}).fetch();
	let stats = {};

	stats.lessonCount = weekLessons.length;
	stats.completedLessonCount = _.filter(weekLessons, {'completed': true}).length;
	stats.assignedLessonCount = _.filter(weekLessons, {'completed': false, 'assigned': true}).length;
	stats.completedLessonPercentage = rounding(stats.completedLessonCount, stats.lessonCount);
	stats.status = status(stats.lessonCount, stats.completedLessonCount, stats.assignedLessonCount);
	stats.groupId = groupId;
	stats.createdOn = new Date();

	Stats.update({studentId: studentId, timeFrameId: weekId, type: 'week'}, {$set: stats}, {upsert: true});
};



/* -------------------- Internal Functions -------------------- */

// Return the Group Id
function getGroupId(submittedGroupId) {
	if (_.isUndefined(submittedGroupId)) {
		return Meteor.user().info.groupId;
	} else {
		return submittedGroupId;
	}
}









