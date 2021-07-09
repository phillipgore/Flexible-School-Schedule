import { Groups } from '../../../api/groups/groups.js';
import moment from 'moment';



let userData = Meteor.subscribe('userData');
let groupStatus = Meteor.subscribe('groupStatus');

FlowRouter.wait();
Tracker.autorun(() => {
	if (userData.ready() && groupStatus.ready() && !FlowRouter._initialized) {
		FlowRouter.initialize()
	}
});



function getInitialData() {
	let initialIds = Groups.findOne({_id: Meteor.user().info.groupId}).initialIds;

	// Initial Frame
	if (!Session.get('selectedFramePosition')) {
		Session.setPersistent('selectedFramePosition', 1);
		Session.setPersistent('selectedFrameClass', 'frame-position-one');
	}

	// Initial Student
	if (!Session.get('selectedStudentId')) {
		Session.set('selectedStudentId', initialIds.studentId);
	}

	// Initial School Year
	if (!Session.get('selectedSchoolYearId')) {
		Session.set('selectedSchoolYearId', initialIds.schoolYearId);
	}

	// Initial Resources
	if (!Session.get('selectedResourceType')) {
		Session.set('selectedResourceType', 'all');
	}

	if (!Session.get('selectedResourceAvailability')) {
		Session.set('selectedResourceAvailability', 'all');
	}

	if (!Session.get('selectedResourceId')) {
		Session.set('selectedResourceId', initialIds.resourceId);
	}

	if (!Session.get('selectedResourceCurrentTypeId')) {
		Session.set('selectedResourceCurrentTypeId', initialIds.resourceType);
	}

	// Initial Term
	if (!Session.get('selectedTermId')) {
		Session.set('selectedTermId', initialIds.termId);
	}

	if (!Session.get('selectedReportingTermId')) {
		Session.set('selectedReportingTermId', initialIds.termId);
	}

	// Initial Week
	if (!Session.get('selectedWeekId')) {
		Session.set('selectedWeekId', initialIds.weekId);
	}

	if (!Session.get('selectedReportingWeekId')) {
		Session.set('selectedReportingWeekId', initialIds.weekId);
	}

	// Initial School Work
	if (!Session.get('selectedSchoolWorkId')) {
		Session.set('selectedSchoolWorkId', initialIds.schoolWorkId);
	}

	if (!Session.get('selectedSchoolWorkType')) {
		Session.set('selectedSchoolWorkType', initialIds.schoolWorkType);
	}

	// Initial Report
	if (!Session.get('selectedReportId')) {
		Session.set('selectedReportId', initialIds.reportId);
	}

	// Initial User
	if (!Session.get('selectedUserId')) {
		Session.set('selectedUserId', initialIds.userId);
	}

	// Initial Paths
	if (!Session.get('planningPathName')) {
		Session.set('planningPathName', 'students');
	}	

	// Initial Group
	if (Meteor.user().info.role === 'Application Administrator' && !Session.get('selectedGroupId')) {
		Session.set('selectedGroupId', initialIds.groupId);
	}
};

// Redirection if signed in.
function checkSignIn(context, redirect) {
	if (Meteor.userId()) {
		getInitialData();
		let initialIds = Groups.findOne({_id: Meteor.user().info.groupId}).initialIds;
		if (Meteor.user().info.role === 'Observer') {
			redirect('/tracking/students/view/1/' + Session.get('selectedStudentId') +'/'+ Session.get('selectedSchoolYearId') +'/'+ Session.get('selectedTermId') +'/'+ Session.get('selectedWeekId'));
		} else if (initialIds.studentId != 'empty' && initialIds.schoolYearId != 'empty' && initialIds.schoolWorkId != 'empty') {
			redirect('/tracking/students/view/1/' + Session.get('selectedStudentId') +'/'+ Session.get('selectedSchoolYearId') +'/'+ Session.get('selectedTermId') +'/'+ Session.get('selectedWeekId'));
		} else {
			redirect('/planning/students/view/1/' + Session.get('selectedStudentId'));
		}
	};
};

FlowRouter.triggers.enter([checkSignIn], {only: [
	'createAccount',
	'verifySent',
	'verifySuccess',
	'signIn',
	'reset',
	'resetSent',
	'resetPassword',
	'resetSuccess'
]});

function initialData(context) {
	getInitialData();
};

FlowRouter.triggers.enter([initialData], {except: [
	'createAccount',
	'verifySent',
	'verifySuccess',
	'signIn',
	'reset',
	'resetSent',
	'resetPassword',
	'resetSuccess',
	'billingError',
	'pausedUser'
]});








