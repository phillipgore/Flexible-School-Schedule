import {Template} from 'meteor/templating';
import {Groups} from '../../api/groups/groups.js';
import {SchoolYears} from '../../api/schoolYears/schoolYears.js';
import {Students} from '../../api/students/students.js';
import moment from 'moment';
import _ from 'lodash'
import './navbar.html';

Template.navbar.helpers({
	user: function() {
		return Meteor.users.findOne();
	},

	userRestricted: function(role) {
		if (role === 'Observer') {
			return true;
		}
		return false;
	},

	planningPath: function() {
		if (Session.get('planningPathName') === 'students') {
			return '/planning/students/view/1/' + Session.get('selectedStudentId');
		}
		if (Session.get('planningPathName') === 'schoolYears') {
			return '/planning/schoolyears/view/1/' + Session.get('selectedSchoolYearId');
		}
		if (Session.get('planningPathName') === 'resources') {
			return '/planning/resources/view/1/' + Session.get('selectedResourceType') +'/'+ Session.get('selectedResourceAvailability') +'/'+ Session.get('selectedResourceId') +'/'+ Session.get('selectedResourceCurrentTypeId');
		}
		if (Session.get('planningPathName') === 'schoolWork') {
			return '/planning/' + Session.get('selectedSchoolWorkType') + '/view/1/' + Session.get('selectedStudentId') +'/'+ Session.get('selectedSchoolYearId') +'/'+ Session.get('selectedSchoolWorkId');
		}
	},

	trackingPath: function() {
		return '/tracking/students/view/1/' + Session.get('selectedStudentId') +'/'+ Session.get('selectedSchoolYearId') +'/'+ Session.get('selectedTermId') +'/'+ Session.get('selectedWeekId');
	},

	reportingPath: function() {
		return '/reporting/view/1/' + Session.get('selectedStudentId') +'/'+ Session.get('selectedSchoolYearId') +'/'+ Session.get('selectedReportingTermId') +'/'+ Session.get('selectedReportingWeekId') +'/'+ Session.get('selectedReportId');
	},

	active(nav) {
		if (Session.get('activeNav') ===  nav) {
			return 'active';
		}
		return;
	},

	group: function() {
		return Groups.findOne({});
	},

	selectedUserId: function() {
		return Session.get('selectedUserId');
	},

	selectedStudentId: function() {
		return Session.get('selectedStudentId');
	},

	selectedSchoolYearId: function() {
		return Session.get('selectedSchoolYearId');
	},

	selectedTermId: function() {
		return Session.get('selectedTermId');
	},

	selectedWeekId: function() {
		return Session.get('selectedWeekId');
	},

	currentPlanningPath: function() {
		return Session.get('currentPlanningPath');
	},

	currentTrackingPath: function() {
		return Session.get('currentTrackingPath');
	},
});

Template.navbar.events({
	'click .js-navbar-restricted'(event) {
		let role = $(event.currentTarget).attr('data-role');
		let section = $(event.currentTarget).attr('data-section');
		Alerts.insert({
			colorClass: 'bg-info',
			iconClass: 'icn-info',
			message: 'Your role of "' + role + '" is not allowed to access the ' + _.capitalize(section) + ' section.',
		});
	},

	'click .js-btn-nav'(event) {
		Session.setPersistent('selectedFramePosition', 1);
		Session.setPersistent('selectedFrameClass', 'frame-position-one');
	},
});