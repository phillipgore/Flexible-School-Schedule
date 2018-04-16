import {Template} from 'meteor/templating';
import {SchoolYears} from '../../../api/schoolYears/schoolYears.js';
import {Terms} from '../../../api/terms/terms.js';
import {Subjects} from '../../../api/subjects/subjects.js';
import {Weeks} from '../../../api/weeks/weeks.js';
import {Lessons} from '../../../api/lessons/lessons.js';
import moment from 'moment';
import './subbarTracking.html';

Template.subbarTracking.onCreated( function() {
	// Subscriptions
	this.subscribe('schoolYearsSubbar');
	this.subscribe('termsSubbar', null, FlowRouter.getParam('selectedSchoolYearId'));

	Session.set('selectedSchoolYearId', FlowRouter.getParam('selectedSchoolYearId'));
	Session.set('selectedTermId', FlowRouter.getParam('selectedTermId'));
});

Template.subbarTracking.helpers({
	schoolYears: function() {
		return SchoolYearsSubbar.find({}, {sort: {startYear: 1}});
	},

	selectedSchoolYearId: function() {
		return FlowRouter.getParam('selectedSchoolYearId');
	},

	selectedSchoolYear: function() {
		return SchoolYearsSubbar.findOne({schoolYearId: FlowRouter.getParam('selectedSchoolYearId')});
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

	terms: function() {
		return TermsSubbar.find({}, {sort: {order: 1}});
	},

	selectedTermId: function() {
		return FlowRouter.getParam('selectedTermId');
	},

	selectedTerm: function() {
		return TermsSubbar.findOne({termId: FlowRouter.getParam('selectedTermId')});
	},

	termStatus: function(termStatus) {
		if (termStatus === 'pending') {
			return 'txt-gray-darker';
		}
		if (termStatus === 'partial') {
			return 'txt-secondary';
		}
		if (termStatus === 'completed') {
			return 'txt-primary';
		}
	},

	activeListItem: function(currentItem, item) {
		if (currentItem === item) {
			return true;
		}
		return false;
	},
});








