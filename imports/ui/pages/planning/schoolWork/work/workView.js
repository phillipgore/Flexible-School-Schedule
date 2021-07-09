import {Template} from 'meteor/templating';
import { SchoolWork } from '../../../../../api/schoolWork/schoolWork.js';
import { Students } from '../../../../../api/students/students.js';
import { Resources } from '../../../../../api/resources/resources.js';
import { SchoolYears } from '../../../../../api/schoolYears/schoolYears.js';
import { Terms } from '../../../../../api/terms/terms.js';
import { Weeks } from '../../../../../api/weeks/weeks.js';
import { Lessons } from '../../../../../api/lessons/lessons.js';
import './workView.html';

Template.workView.onCreated( function() {	
	let template = Template.instance();
	
	template.autorun(() => {
		this.schoolWorkData = Meteor.subscribe('schoolWorkView', FlowRouter.getParam('selectedSchoolWorkId'));
	});
});

Template.workView.onRendered( function() {
	Session.set({
		toolbarType: 'schoolWork',
		editUrl: '/planning/work/edit/3/' + FlowRouter.getParam('selectedStudentId') +'/'+ FlowRouter.getParam('selectedSchoolYearId') +'/'+ FlowRouter.getParam('selectedSchoolWorkId'),
		labelThree: 'School Work',
		activeNav: 'planningList',
	});
});

Template.workView.helpers({
	subscriptionReady: function() {
		return Template.instance().schoolWorkData.ready();
	},

	schoolWork: function() {
		return SchoolWork.findOne({_id: FlowRouter.getParam('selectedSchoolWorkId')});
	},

	schoolYear: function() {
		return SchoolYears.findOne({_id: FlowRouter.getParam('selectedSchoolYearId')})
	},

	terms: function() {
		return Terms.find({schoolYearId: FlowRouter.getParam('selectedSchoolYearId')})
	},

	termLessons: function(termId) {
		let lessonCount = Lessons.find({termId: termId}).count();
		if (lessonCount === 1) {
			return lessonCount + ' Segment';
		}
		return lessonCount + ' Segments';
	},

	resources: function(resourceIds) {
		return Resources.find({_id: {$in: resourceIds}});
	},

	showCommas: function(length, index) {
		if (length != parseInt(index) + 1) return ','
	}
});

Template.workView.events({
	
});





