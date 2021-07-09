import { Template } from 'meteor/templating';
import { Groups } from '../../../api/groups/groups.js';
import { Reports } from '../../../api/reports/reports.js';
import { SchoolYears } from '../../../api/schoolYears/schoolYears.js';
import { Students } from '../../../api/students/students.js';
import { Resources } from '../../../api/resources/resources.js';
import { Subjects } from '../../../api/subjects/subjects.js';
import { SchoolWork } from '../../../api/schoolWork/schoolWork.js';
import { Notes } from '../../../api/notes/notes.js';
import { Terms } from '../../../api/terms/terms.js';
import { Weeks } from '../../../api/weeks/weeks.js';
import { Lessons } from '../../../api/lessons/lessons.js';

import {minutesConvert} from '../../../modules/functions';
import _ from 'lodash'
import './reportingView.html';

Template.reportingView.onCreated( function() {	
	let template = Template.instance();
	
	template.autorun(() => {
		this.reportData = Meteor.subscribe('reportData', FlowRouter.getParam('selectedStudentId'), FlowRouter.getParam('selectedSchoolYearId'), FlowRouter.getParam('selectedTermId'), FlowRouter.getParam('selectedWeekId'), FlowRouter.getParam('selectedReportId'));
		this.studentData = Meteor.subscribe('student', FlowRouter.getParam('selectedStudentId'));
	});
});

Template.reportingView.onRendered( function() {
	Session.set({
		labelTwo: '',
		selectedSchoolYearId: FlowRouter.getParam('selectedSchoolYearId'),
		selectedStudentId: FlowRouter.getParam('selectedStudentId'),
		toolbarType: 'report',
		editUrl: '/reporting/edit/2/' + FlowRouter.getParam('selectedReportId'),
		activeNav: 'reportingList',
	});
});

Template.reportingView.helpers({
	subscriptionReady: function() {
		if (Template.instance().reportData.ready() && Template.instance().studentData.ready()) {
			return true;
		}
		return false;
	},

	user: function() {
		return Meteor.users.findOne();
	},

	selectedStudent: function() {
		return Students.findOne({_id: FlowRouter.getParam('selectedStudentId')});
	},

	selectedSchoolYear: function() {
		return SchoolYears.findOne({_id: FlowRouter.getParam('selectedSchoolYearId')});
	},

	selectedTerm: function() {
		return Terms.findOne({_id: FlowRouter.getParam('selectedTermId')});
	},

	termLabel: function(termId, termOrder) {
		if (termId === 'allTerms' || !termOrder) {
			return 'All Terms';
		}
		return 'Term ' + termOrder
	},

	selectedWeek: function() {
		return Weeks.findOne({_id: FlowRouter.getParam('selectedWeekId')});
	},

	weekLabel: function(weekId, weekOrder) {
		if (weekId === 'allWeeks' || !weekOrder) {
			return 'All Weeks';
		}
		return 'Week ' + weekOrder
	},

	selectedReport: function() {
		return Reports.findOne({_id: FlowRouter.getParam('selectedReportId')})
	},

	studentsSchoolYearsCount: function() {
		if (Students.find().count() && SchoolYears.find().count()) {
			return true;
		}
		return false;
	},

	reports: function() {
		return Reports.find({}, {sort: {name: 1}});
	},

	selectedReport: function() {
		return Reports.findOne({_id: FlowRouter.getParam('selectedReportId')})
	},

	reportName: function(name) {
		Session.set({labelTwo: name});
		return false;
	},
});

Template.reportingView.events({
	
});










