import {Template} from 'meteor/templating';
import { Students } from '../../../api/students/students.js';
import { SchoolYears } from '../../../api/schoolYears/schoolYears.js';
import { SchoolWork } from '../../../api/schoolWork/schoolWork.js';
import { Terms } from '../../../api/terms/terms.js';
import { Weeks } from '../../../api/weeks/weeks.js';
import { Subjects } from '../../../api/subjects/subjects.js';
import { Lessons } from '../../../api/lessons/lessons.js';

import './trackingView.html';

Template.trackingView.onCreated( function() {
	let template = Template.instance();

	Session.set('hasChanged', false);
	template.schoolWork = new ReactiveVar();
	
	template.autorun(() => {
		this.trackingData = Meteor.subscribe('trackingViewPub', FlowRouter.getParam('selectedStudentId'), FlowRouter.getParam('selectedSchoolYearId'), FlowRouter.getParam('selectedWeekId'));
		Session.set({editUrl: '/tracking/students/edit/2/' + FlowRouter.getParam('selectedStudentId') +'/'+ FlowRouter.getParam('selectedSchoolYearId') +'/'+ FlowRouter.getParam('selectedTermId') +'/'+ FlowRouter.getParam('selectedWeekId')});
	});
});

Template.trackingView.onRendered( function() {
	document.getElementsByClassName('frame-two')[0].scrollTop = 0;
	Session.set({
		selectedReportingTermId: FlowRouter.getParam('selectedTermId'),
		selectedReportingWeekId: FlowRouter.getParam('selectedWeekId'),
		toolbarType: 'tracking',
		editUrl: '/tracking/students/edit/2/' + FlowRouter.getParam('selectedStudentId') +'/'+ FlowRouter.getParam('selectedSchoolYearId') +'/'+ FlowRouter.getParam('selectedTermId') +'/'+ FlowRouter.getParam('selectedWeekId'),
		newUrl: '',
		activeNav: 'trackingList',
	});
});

Template.trackingView.helpers({
	subscriptionReady: function() {
		return Template.instance().trackingData.ready();
	},

	student: function() {
		return Students.findOne({_id: FlowRouter.getParam('selectedStudentId')});
	},

	selectedSchoolYearId: function() {
		return FlowRouter.getParam('selectedSchoolYearId');
	},

	selectedSchoolYear: function() {
		return SchoolYears.findOne({_id: FlowRouter.getParam('selectedSchoolYearId')});
	},

	selectedTerm: function() {
		return Terms.findOne({_id: FlowRouter.getParam('selectedTermId')});
	},

	selectedWeek: function() {
		return Weeks.findOne({_id: FlowRouter.getParam('selectedWeekId')});
	},

	weekLessonsExist: function() {
		if (Lessons.find({weekId: FlowRouter.getParam('selectedWeekId')}).count()) {
			return true;
		}
		return false;
	},

	schoolWork: function() {
		if (Template.instance().trackingData.ready()) {
			return getMiddleSchoolWork(FlowRouter.getParam('selectedStudentId'), FlowRouter.getParam('selectedSchoolYearId'));
		}
	},

	studentName(first, last) {
		if (first && last) {
			Session.set({labelTwo: first + ' ' + last});
		}
		return false;
	},

	studentsSchoolYearsCount: function() {
		if (Students.find().count() && SchoolYears.find().count()) {
			return true;
		}
		return false;
	},
});

let getMiddleSchoolWork = (studentId, schoolYearId) => {
	let schoolWork = [];

	// Subjects and Work
	Subjects.find({schoolYearId: FlowRouter.getParam('selectedSchoolYearId'), studentId: FlowRouter.getParam('selectedStudentId')}, {sort: {name: 1}}).forEach(subject => {
		let subjectSchoolWork = SchoolWork.find({subjectId: subject._id}, {sort: {name: 1}});
		subject.type = 'subject';
		subject.hasSchoolWork = subjectSchoolWork.count() === 0 ? false : true;
		schoolWork.push(subject);
		subjectSchoolWork.forEach(workItem => {
			workItem.type = 'work'
			schoolWork.push(workItem);
		})
	});

	// No Subject and Work
	let noSubjectSchoolWork = SchoolWork.find({schoolYearId: FlowRouter.getParam('selectedSchoolYearId'), studentId: FlowRouter.getParam('selectedStudentId'), subjectId: {$exists: false}}, {sort: {name: 1}});
	schoolWork.push({
		_id: 'noSubject',
		name: 'No Subject',
		type: 'subject',
		hasSchoolWork: noSubjectSchoolWork.count() === 0 ? false : true,
	});
	noSubjectSchoolWork.forEach(workItem => {
		workItem.type = 'work';
		workItem.subjectId = 'noSubject';
		schoolWork.push(workItem);
	});

	// Middle SchoolWork Item
	let middleSchoolWork = schoolWork[Math.ceil(schoolWork.length / 2)];
	let dividingSchoolwork;
	
	// Dividing SchoolWork Item
	if (middleSchoolWork.type === 'subject') {
		dividingSchoolwork = {
			_id: middleSchoolWork._id,
			type: middleSchoolWork.type,
		}
	} 
	if (middleSchoolWork.type === 'work') {
		let getSubjectSchoolWork = (middleSchoolWork) => {
			if (middleSchoolWork.subjectId === 'noSubject') {
				return SchoolWork.find({subjectId: {$exists: false}}, {sort: {name: 1}}).fetch()
			}
			return SchoolWork.find({subjectId: middleSchoolWork.subjectId}, {sort: {name: 1}}).fetch()
		}

		let subjectSchoolWork = getSubjectSchoolWork(middleSchoolWork);
		let schoolWorkCount = subjectSchoolWork.length;
		let middleSchoolWorkPositiion = subjectSchoolWork.findIndex(work => work._id === middleSchoolWork._id);

		if (schoolWorkCount > 4 || middleSchoolWorkPositiion >= (Math.floor(schoolWorkCount / 2))) {
			dividingSchoolwork = {
				_id: middleSchoolWork._id,
				type: middleSchoolWork.type,
				subjectId: middleSchoolWork.subjectId,
			}
		} else {
			let divdingSchoolWorkPosition = schoolWork.findIndex(work => work._id === middleSchoolWork._id);
			let newDividingSchoolwork = schoolWork.find((work, index) => work.type === 'subject' && index > divdingSchoolWorkPosition)
			if (newDividingSchoolwork) {
				dividingSchoolwork = {
					_id: newDividingSchoolwork._id,
					type: 'subject',
				}
			} else {
				dividingSchoolwork = {
					_id: middleSchoolWork.subjectId,
					type: 'subject',
				}
			}
		}
	}

	// Position Information
	schoolWork.forEach((work, index) => {
		let prevWork = schoolWork[index - 1];
		if (prevWork && prevWork.type === 'work') {
			work.precededByWork = true;
		} else if (prevWork && prevWork.type === 'subject') {
			work.precededBySubject = true;
		} else {
			work.precededBySubject = false;
			work.precededByWork = false;
		}
	})

	// Creating the Columns
	let dividingSchoolworkIndex = schoolWork.findIndex(work => {
		return work._id === dividingSchoolwork._id;
	});

	return {
		columnOne: schoolWork.slice(0, dividingSchoolworkIndex),
		columnTwo: schoolWork.slice(dividingSchoolworkIndex)
	}
};









