import {Template} from 'meteor/templating';
import {Paths} from '../../../api/paths/paths.js';
import {SchoolYears} from '../../../api/schoolYears/schoolYears.js';
import {Students} from '../../../api/students/students.js';
import {SchoolWork} from '../../../api/schoolWork/schoolWork.js';
import './subbarSchoolWork.html';

import moment from 'moment';
import _ from 'lodash'


Template.subbarSchoolWork.onCreated( function() {
	let template = Template.instance();
	
	template.autorun(() => {
		this.studentData = Meteor.subscribe('allStudents');
		this.schoolYearData = Meteor.subscribe('allSchoolYears');
		this.schoolYearPathData = Meteor.subscribe('allSchoolYearPaths');
	});
});

Template.subbarSchoolWork.helpers({

	/* -------------------- Subscritpions -------------------- */

	studentSubReady: function() {
		return Template.instance().studentData.ready();
	},

	schoolYearSubReady: function() {
		return Template.instance().schoolYearData.ready();
	},

	
	/* -------------------- Students -------------------- */

	students: function() {
		return Students.find({}, {sort: {birthday: 1, lastName: 1, firstName: 1}});
	},

	selectedStudent: function() {
		return Students.findOne({_id: FlowRouter.getParam('selectedStudentId')});
	},

	selectedStudentId: function() {
		return FlowRouter.getParam('selectedStudentId');
	},

	
	/* -------------------- SchooYears -------------------- */

	schoolYears: function() {
		return SchoolYears.find({}, {sort: {startYear: 1}});
	},

	selectedSchoolYear: function() {
		return SchoolYears.findOne({_id: FlowRouter.getParam('selectedSchoolYearId')});
	},

	selectedSchoolYearId: function() {
		return FlowRouter.getParam('selectedSchoolYearId');
	},

	
	/* -------------------- Joins -------------------- */

	studentsSchoolYearsCount: function() {
		if (Students.find().count() && SchoolYears.find().count()) {
			return true;
		}
		return false;
	},

	firstSchoolWorkId: function(studentId, timeFrameId) {
		let firstSchoolWorkId = Paths.findOne({studentId: studentId, timeFrameId: timeFrameId}) && Paths.findOne({studentId: studentId, timeFrameId: timeFrameId}).firstSchoolWorkId;
		if (firstSchoolWorkId) {
			return firstSchoolWorkId;
		}
		return 'empty';
	},

	firstSchoolWorkType: function(studentId, timeFrameId) {
		let firstSchoolWorkType = Paths.findOne({studentId: studentId, timeFrameId: timeFrameId}) && Paths.findOne({studentId: studentId, timeFrameId: timeFrameId}).firstSchoolWorkType;
		if (firstSchoolWorkType) {
			return firstSchoolWorkType;
		}
		return 'empty';
	},
	
	activeListItem: function(currentItem, item) {
		if (currentItem === item) {
			return true;
		}
		return false;
	},

	yearStatus: function(schoolYearStatus) {
		if (schoolYearStatus === 'pending') {
			return 'txt-gray-darker';
		}
		if (schoolYearStatus === 'partial') {
			return 'txt-secondary';
		}
		if (schoolYearStatus === 'completed') {
			return 'txt-primary';
		}
	},
});