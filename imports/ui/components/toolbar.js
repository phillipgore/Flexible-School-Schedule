import {Template} from 'meteor/templating';
import { Groups } from '../../api/groups/groups.js';
import { Students } from '../../api/students/students.js';
import './toolbar.html';

import _ from 'lodash'

Template.toolbar.helpers({
	selectedFramePosition: function() {
		return Session.get('selectedFramePosition');
	},

	user: function() {
		return Meteor.users.findOne();
	},
	
	logo: function() {
		if(Meteor.userId() && Meteor.user().status.active) {
			return false;
		}
		return true;
	},

	backButton: function() {
		let windowWidth = Session.get('windowWidth');
		let type = Session.get('toolbarType');
		if (type === 'new' || type === 'edit') {
			return false;
		}
		if (windowWidth <= 768 && Session.get('selectedFramePosition') === 3) {
			return true;
		}
		if (windowWidth <= 480 && Session.get('selectedFramePosition') === 2) {
			return true;
		}
		return false;
	},

	labelOne() {
		return Session.get('labelOne');
	},

	labelTwo() {
		return Session.get('labelTwo');
	},

	labelThree() {
		return Session.get('labelThree');
	},

	newUrl: function() {
		if (Session.get('toolbarType') === 'schoolWork' || Session.get('toolbarType') === 'subject') {
			let initialIds = Groups.findOne({_id: Meteor.user().info.groupId}).initialIds;
			if (initialIds.studentId === 'empty' || initialIds.schoolYearId === 'empty') {
				return '#';
			}
			return Session.get('newUrl');
		}
		return Session.get('newUrl');
	},

	newable: function() {
		let type = Session.get('toolbarType');
		if (type === 'tracking' || type === 'billing' || type === 'support' || type === 'new' || type === 'edit') {
			return false;
		}
		if (Session.get('selectedFramePosition') === 1 && type === 'report') {
			return true;
		}
		if (Session.get('selectedFramePosition') === 2 && type != 'report' && type != 'resource' && type != 'schoolWork') {
			return true;
		}
		return false;
	},

	schoolWorkNewable: function() {
		let type = Session.get('toolbarType');
		if (type === 'new' || type === 'edit') {
			return false;
		}
		if (Session.get('selectedFramePosition') === 2 && Session.get('toolbarType') === 'schoolWork') {
			return true;
		}
		return false;
	},

	resourceNewable: function() {
		let type = Session.get('toolbarType');
		if (type === 'new' || type === 'edit') {
			return false;
		}
		if (Session.get('selectedFramePosition') === 2 && Session.get('toolbarType') === 'resource') {
			return true;
		}
		return false;
	},

	actionable() {
		let type = Session.get('toolbarType');
		let position = Session.get('selectedFramePosition');

		if (type === 'new' || type === 'edit') {
			return false;
		}
		if (position === 2 && type === 'report' || position === 2 && type === 'tracking') {
			return true;
		}
		if (position === 3 && type != 'tracking') {
			return true;
		}
		return false;
	},

	schoolWorkDisabled: function() {
		let initialIds = Groups.findOne({_id: Meteor.user().info.groupId}).initialIds;
		if (initialIds.studentId == 'empty' || initialIds.schoolYearId == 'empty') {
			return true;
		}
		return false;
	},

	selectedStudentId: function() {
		return Session.get('selectedStudentId');
	},

	selectedSchoolYearId: function() {
		return Session.get('selectedSchoolYearId');
	},

	editUrl: function() {
		return Session.get('editUrl');
	},

	editableDeletable: function() {
		let type = Session.get('toolbarType');

		if (type === 'edit') {
			return false;
		}

		if (type === 'schoolWork') {
			if (FlowRouter.getParam('selectedSchoolWorkId') === 'empty') {
				return false;
			}
			return true;
		}

		if (type === 'subject') {
			if (FlowRouter.getParam('selectedSubjectId') === 'empty') {
				return false;
			}
			return true;
		}

		if (type === 'tracking') {
			if (FlowRouter.getParam('selectedStudentId') === 'empty' || FlowRouter.getParam('selectedSchoolWorkId') === 'empty') {
				return false;
			}
			return true;
		}

		let initialIds = Groups.findOne({_id: Meteor.user().info.groupId}).initialIds;
		if (initialIds[Session.get('toolbarType') + 'Id'] === 'empty') {
			return false;
		}

		return true;
	},

	deletable: function() {
		let type = Session.get('toolbarType');
		if (type === 'user') {
			let verified = $('.js-user .active').attr('data-verified');
			let active = $('.js-user .active').attr('data-active');

			if (active && !verified) {
				return true;
			}
			return false;
		}
		if (type === 'tracking' || type === 'billing' || type === 'support' || type === 'new' || type === 'edit') {
			return false;
		}
		return true;
	},

	deleteClass: function() {
		return 'js-delete-' + Session.get('toolbarType');
	},

	equal: function(itemOne, itemTwo) {
		if (itemOne === itemTwo) {
			return true;
		}
		return false;
	},

	isImpersonation: function() {
		return Session.get('isImpersonation');
	},
});

Template.toolbar.events({
	'click .js-go-home'(event) {
		window.location.href = 'https://www.aflexiblehomeschool.com/';
	},

	'click .js-btn-back'(event) {
		event.preventDefault();

		let framePositionIndex = FlowRouter.current().route.path.split( '/' ).indexOf(':selectedFramePosition');
		let framePosition = parseInt(FlowRouter.getParam('selectedFramePosition')) - 1;
		let pathArray = window.location.pathname.split( '/' )

		pathArray[framePositionIndex] = framePosition;
		let newPath = pathArray.join("/");

		FlowRouter.go(newPath)
	},

	'click .js-new-schoolWork'(event) {
		event.preventDefault();

		if (!$(event.currentTarget).hasClass('disabled')) {
			FlowRouter.go($(event.currentTarget).attr('href'));
		}
	},

	'click .js-delete-student'(event) {
		event.preventDefault();

		Dialogs.insert({
			heading: 'Confirmation',
			message: 'Are you sure you want to delete this Student?',
			confirmClass: 'js-delete js-delete-student-confirmed',
		});
	},

	'click .js-delete-schoolYear'(event) {
		event.preventDefault();

		Dialogs.insert({
			heading: 'Confirmation',
			message: 'Are you sure you want to delete this School Year?',
			confirmClass: 'js-delete js-delete-school-year-confirmed',
		});
	},
	
	'click .js-delete-resource'(event) {
		event.preventDefault();

		Dialogs.insert({
			heading: 'Confirmation',
			message: 'Are you sure you want to delete this Resource?',
			confirmClass: 'js-delete js-delete-resource-confirmed',
		});
	},

	'click .js-delete-subject'(event) {
		event.preventDefault();

		Dialogs.insert({
			heading: 'Confirmation',
			message: 'Are you sure you want to delete this Subject?',
			confirmClass: 'js-delete js-delete-subject-confirmed',
		});
	},

	'click .js-delete-schoolWork'(event) {
		event.preventDefault();

		Dialogs.insert({
			heading: 'Confirmation',
			message: 'Are you sure you want to delete this School Work?',
			confirmClass: 'js-delete js-delete-schoolWork-confirmed',
		});
	},

	'click .js-delete-report'(event) {
		event.preventDefault();

		Dialogs.insert({
			heading: 'Confirmation',
			message: 'Are you sure you want to delete this Report?',
			confirmClass: 'js-delete js-delete-report-confirmed',
		});
	},

	'click .js-delete-user'(event) {
		if (!$(event.currentTarget).hasClass('disabled')) {
			Dialogs.insert({
				heading: 'Confirmation',
				message: 'Are you sure you want to delete this User?',
				confirmClass: 'js-delete js-delete-user-confirmed',
			});
		}
	},

	'click .js-return-to-back-office'(event) {
		event.preventDefault();
    	let currentGroupId = Meteor.user().info.groupId;

    	Session.set({
			isImpersonation: false,
			appAdminId: '',
			selectedFramePosition: '',
			selectedFrameClass: '',
			selectedStudentId: '',
			selectedSchoolYearId: '',
			selectedResourceType: '',
			selectedResourceAvailability: '',
			selectedResourceId: '',
			selectedResourceCurrentTypeId: '',
			selectedTermId: '',
			selectedReportingTermId: '',
			selectedWeekId: '',
			selectedReportingWeekId: '',
			selectedSchoolWorkId: '',
			selectedSchoolWorkType: '',
			selectedReportId: '',
			selectedUserId: '',
			planningPathName: '',
			selectedGroupId: '',
		});

		window.location = '/office/accounts/reset/view/2/' + Session.get('selectedStatusId') +'/'+ currentGroupId;
	},

	'click .js-loggout-user'(event) {
		event.preventDefault();
		Meteor.logoutOtherClients(function() {
			Alerts.insert({
				colorClass: 'bg-info',
				iconClass: 'icn-info',
				message: 'This user has been logged out on all devices.',
			});
		});
	},
});









