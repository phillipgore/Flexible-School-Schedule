import {Groups} from '../../api/groups/groups.js';
import {Students} from '../../api/students/students.js';
import {SchoolYears} from '../../api/schoolYears/schoolYears.js';
import {Terms} from '../../api/terms/terms.js';
import {Weeks} from '../../api/weeks/weeks.js';
import {SchoolWork} from '../../api/schoolWork/schoolWork.js';
import {Resources} from '../../api/resources/resources.js';
import {Lessons} from '../../api/lessons/lessons.js';
import {Reports} from '../../api/reports/reports.js';

import moment from 'moment';
import _ from 'lodash';


/* -------------------- Exported Functions -------------------- */

// Intial Ids for Student, School Year, Term, Week and School Work.
export function primaryInitialIds (submittedGroupId) {
	// console.log('primaryInitialIds start');	
	let groupId = getGroupId(submittedGroupId);
	// console.log('groupId: ' + groupId);

	let ids = {};

	// Get First Student
	let firstStudent = Students.findOne({groupId: groupId}, {sort: {birthday: 1, lastName: 1, 'preferredFirstName.name': 1}, fields: {_id: 1}});
	if (firstStudent) {ids.studentId = firstStudent._id} else {ids.studentId = 'empty'};
	// console.log('firstStudent');

	// Get First School Year
	let firstSchoolYear = getFirstSchoolYearId(groupId);
	ids.schoolYearId = firstSchoolYear;
	// console.log('firstSchoolYear');

	// Get First School Work
	if (firstStudent && firstSchoolYear != 'empty') {
		let firstSchoolWork = SchoolWork.findOne(
			{groupId: groupId, schoolYearId: firstSchoolYear, studentId: firstStudent._id},
			{sort: {name: 1}, fields: {_id: 1}}
		)	
		// console.log('firstSchoolWork');

		if (firstSchoolWork) {ids.schoolWorkId = firstSchoolWork._id} else {ids.schoolWorkId = 'empty'};			
		// console.log('firstSchoolWork 2');
	} else {
		ids.schoolWorkId = 'empty';
		// console.log('firstSchoolWork empty');
	}
	// Get First Term and Week
	if (ids.schoolYearId === 'empty') {
		ids.termId = 'empty';
		ids.weekId = 'empty';
		// console.log('termId weekId empty');
	} else {
		if (ids.studentId === 'empty') { // First Student: False
			let firstTerm = Terms.findOne(
				{groupId: groupId, schoolYearId: firstSchoolYear},
				{sort: {order: 1}, fields: {_id: 1}}
			)

			if (firstTerm) { // First Term: True
				ids.termId = firstTerm._id	
				// console.log('firstTerm');

				let firstWeek = Weeks.findOne(
					{groupId: groupId, schoolYearId: firstSchoolYear, termId: firstTerm._id},
					{sort: {order: 1}, fields: {_id: 1}}
				)
				if (firstWeek) {ids.weekId = firstWeek._id} else {ids.weekId = 'empty'};
				// console.log('firstWeek');
			} else { // First Term: False
				ids.termId = 'empty'
				ids.weekId = 'empty'
			};
		} else { // First Student: True
			let firstIncompleteLesson = Lessons.findOne(
				{studentId: firstStudent._id, schoolYearId: firstSchoolYear, completed: false},
				{sort: {termOrder: 1, weekOrder: 1, order: 1}, fields: {termId: 1, weekId: 1}}
			);
			// console.log('firstIncompleteLesson');

			let firstCompletedLesson = Lessons.findOne(
				{studentId: firstStudent._id, schoolYearId: firstSchoolYear, completed: true},
				{sort: {termOrder: 1, weekOrder: 1, order: 1}, fields: {termId: 1, weekId: 1}}
			);
			// console.log('firstCompletedLesson');

			if (firstIncompleteLesson) { // First Incomplete Lesson: True
				ids.termId = firstIncompleteLesson.termId;
				ids.weekId = firstIncompleteLesson.weekId;
			} else if (firstCompletedLesson) { // First Incomplete Lesson: false && First Complete Lesson: True
				ids.termId = firstCompletedLesson.termId;
				ids.weekId = firstCompletedLesson.weekId;
			} else { // First Incomplete Lesson: false && First Complete Lesson: False
				let firstTerm = Terms.findOne(
					{groupId: groupId, schoolYearId: firstSchoolYear},
					{sort: {order: 1}, fields: {_id: 1}}
				)

				if (firstTerm) { // First Term: True
					ids.termId = firstTerm._id
					let firstWeek = Weeks.findOne(
						{groupId: groupId, schoolYearId: firstSchoolYear, termId: firstTerm._id},
						{sort: {order: 1}, fields: {_id: 1}}
					)
					if (firstWeek) {ids.weekId = firstWeek._id} else {ids.weekId = 'empty'};
					// console.log('firstWeek 2');
				} else { // First Term: False
					ids.termId = 'empty'
					ids.weekId = 'empty'
				};
			}
		}
	}

	Groups.update(groupId, {$set: {
		'initialIds.studentId': ids.studentId,
		'initialIds.schoolYearId': ids.schoolYearId,
		'initialIds.termId': ids.termId,
		'initialIds.weekId': ids.weekId,
		'initialIds.schoolWorkId': ids.schoolWorkId,
	}});
	
	// console.log('primaryInitialIds end');
	return groupId;
};

// Intial Ids for Resources.
export function resourcesInitialIds (submittedGroupId) {
	// console.log('resourcesInitialIds start');
	let groupId = getGroupId(submittedGroupId);
	let ids = {};

	let firstResource = Resources.findOne({groupId: groupId}, {sort: {title: 1}, fields: {type: 1}});
	if (firstResource) {ids.resourceId = firstResource._id} else {ids.resourceId = 'empty'};
	if (firstResource) {ids.resourceType = firstResource.type} else {ids.resourceType = 'empty'};

	Groups.update(groupId, {$set: {
		'initialIds.resourceId': ids.resourceId,
		'initialIds.resourceType': ids.resourceType,
	}});
	
	// console.log('resourcesInitialIds end');
	return groupId;
};

// Intial Id for Users.
export function usersInitialId (submittedGroupId) {
	// console.log('usersInitialId start');
	let groupId = getGroupId(submittedGroupId);
	let ids = {};

	let firstUser = Meteor.users.findOne({'info.groupId': groupId, 'status.active': true}, {sort: {'info.lastName': 1, 'info.firstName': 1}});
	ids.userId = firstUser._id;
	if (firstUser) {ids.userId = firstUser._id} else {ids.userId = 'empty'};

	Groups.update(groupId, {$set: {
		'initialIds.userId': ids.userId,
	}});
	
	// console.log('usersInitialId end');
	return groupId;
};

// Intial Id for Reports.
export function reportsInitialId (submittedGroupId) {
	// console.log('reportsInitialId start')
	let groupId = getGroupId(submittedGroupId);
	let ids = {};

	let firstReport = Reports.findOne({groupId: groupId}, {sort: {name: 1}});
	if (firstReport) {ids.reportId = firstReport._id} else {ids.reportId = 'empty'};

	Groups.update(groupId, {$set: {
		'initialIds.reportId': ids.reportId,
	}});
	
	// console.log('reportsInitialId end')
	return groupId;
};

// Intial Id for Groups.
export function groupsInitialId (submittedGroupId) {
	// console.log('groupsInitialId start');
	let groupId = getGroupId(submittedGroupId);
	let group = Groups.findOne({_id: groupId});
	let ids = {};

	if (group.appAdmin) {
		let firstGroup = Groups.findOne({appAdmin: false}, {fields: {_id: 1}, sort: {createdOn: -1}}); 
		if (firstGroup) {ids.groupId = firstGroup._id} else {ids.groupId = 'empty'};
	} else {
		ids.groupId = 'empty'
	}

	Groups.update(groupId, {$set: {
		'initialIds.groupId': ids.groupId,
	}});

	// console.log('groupsInitialId end');
	return group._id;
};



/* -------------------- Internal Functions -------------------- */

// Return the Group Id
function getGroupId(submittedGroupId) {
	if (_.isUndefined(submittedGroupId)) {
		// console.log('groupId not submitted: ' + submittedGroupId)
		return Meteor.user().info.groupId;
	} else {
		// console.log('groupId submitted: ' + submittedGroupId)
		return submittedGroupId;
	}
}

// Return the Start Year
function startYearFunction() {
	let year = moment().year();
	let month = moment().month();

	if (month < 6) {
		return year = (year - 1).toString();
	}

	return year.toString();
};

// Return First School Year
function getFirstSchoolYearId(groupId) {
	let currentYear = startYearFunction();

	let schoolYears = SchoolYears.find(
		{groupId: groupId}, 
		{sort: {starYear: 1}, fields: {startYear: 1, endYear: 1}}
	).fetch();

	if (schoolYears.length) {
		if (schoolYears.length === 1) {
			// console.log('schoolYear 1')
			return schoolYears[0]._id;
		}

		let gteFirstSchoolYear = _.find(_.orderBy(schoolYears, ['startYear'], ['asc']), year => {return year.startYear >= currentYear});
		if (!_.isUndefined(gteFirstSchoolYear)) {
			// console.log('schoolYear gte')
			return gteFirstSchoolYear._id;
		}

		let lteFirstSchoolYear = _.find(_.orderBy(schoolYears, ['startYear'], ['desc']), year => {return year.startYear <= currentYear});
		// console.log('schoolYear lte')
		return lteFirstSchoolYear._id;
	} else {
		// console.log('schoolYear empty')
		return 'empty'
	}
}








