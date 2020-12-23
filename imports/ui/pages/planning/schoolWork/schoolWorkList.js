import {Template} from 'meteor/templating';
import { Groups } from '../../../../api/groups/groups.js';
import { SchoolWork } from '../../../../api/schoolWork/schoolWork.js';
import { Subjects } from '../../../../api/subjects/subjects.js';
import { Students } from '../../../../api/students/students.js';
import './schoolWorkList.html';

SchooWorkList = new Mongo.Collection('schooWorkList');

Template.schoolWorkList.onCreated( function() {
	let template = Template.instance();
	
	template.autorun(() => {
		this.subjectData = Meteor.subscribe('schooYearStudentSubject', FlowRouter.getParam('selectedSchoolYearId'), FlowRouter.getParam('selectedStudentId'));
		this.schoolWorkData = Meteor.subscribe('schooYearStudentSchoolWork', FlowRouter.getParam('selectedSchoolYearId'), FlowRouter.getParam('selectedStudentId'));
		this.schoolWorkStats = Meteor.subscribe('schoolWorkStats');
	});
});

Template.schoolWorkList.onRendered( function() {
	Session.set({
		labelTwo: 'School Work',
		newUrl: '/planning/work/new/3/' + FlowRouter.getParam('selectedStudentId') +'/'+ FlowRouter.getParam('selectedSchoolYearId'),
		activeNav: 'planningList',
	});
});

Template.schoolWorkList.helpers({
	subscriptionReady: function() {
		if (Template.instance().subjectData.ready() && Template.instance().schoolWorkData.ready() && Template.instance().schoolWorkStats.ready()) {
			return true;
		}
	},

	schooWorkList: function() {
		let subjects = Subjects.find({schoolYearId: FlowRouter.getParam('selectedSchoolYearId'), studentId: FlowRouter.getParam('selectedStudentId')}).fetch();
		subjects.forEach(subject => subject.type = 'subject');

		let workItems = SchoolWork.find({schoolYearId: FlowRouter.getParam('selectedSchoolYearId'), studentId: FlowRouter.getParam('selectedStudentId')}).fetch();
		workItems.forEach(workItem => workItem.type = 'work');

		return _.sortBy(subjects.concat(workItems), ['name']);
	},

	studentsSchoolYearsCount: function() {
		let initialIds = Groups.findOne({_id: Meteor.user().info.groupId}).initialIds && Groups.findOne({_id: Meteor.user().info.groupId}).initialIds;
		if (initialIds.studentId != 'empty' && initialIds.schoolYearId != 'empty') {
			return true;
		}
		return false;
	},
});











