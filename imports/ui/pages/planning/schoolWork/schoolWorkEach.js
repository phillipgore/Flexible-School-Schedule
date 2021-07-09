import { Template } from 'meteor/templating';
import { Subjects } from '../../../../api/subjects/subjects.js';
import { SchoolWork } from '../../../../api/schoolWork/schoolWork.js';
import './schoolWorkEach.html';

Template.schoolWorkEach.onCreated( function() {
	Session.setPersistent('unScrolled', true);
});

Template.schoolWorkEach.onRendered( function() {
	
});

Template.schoolWorkEach.helpers({
	scroll: function() {
		let getSchoolWorkCount = () => {
			if (Session.get('selectedSchoolWorkType') === 'subjects') {
				return Subjects.find({_id: FlowRouter.getParam('selectedSubjectId')}).count();
			}
			return SchoolWork.find({_id: FlowRouter.getParam('selectedSchoolWorkId')}).count();
		};

		let getSchoolWorkId = () => {
			if (Session.get('selectedSchoolWorkType') === 'subjects') {
				return FlowRouter.getParam('selectedSubjectId');
			}
			return FlowRouter.getParam('selectedSchoolWorkId');
		};

		if (getSchoolWorkCount() && getSchoolWorkId() && Session.get('unScrolled')) {
			setTimeout(function() {
				let newScrollTop = document.getElementById(getSchoolWorkId()).getBoundingClientRect().top - 130;
				if (window.screen.availWidth > 640) {
					document.getElementsByClassName('frame-two')[0].scrollTop = newScrollTop;
				}
				Session.setPersistent('unScrolled', false);
				return false;
			}, 100);
		}
	},

	subjects: function() {
		return Subjects.find({schoolYearId: FlowRouter.getParam('selectedSchoolYearId'), studentId: FlowRouter.getParam('selectedStudentId')});
	},
	
	selectedStudentId: function() {
		return Session.get('selectedStudentId');
	},

	selectedSchoolYearId: function() {
		return Session.get('selectedSchoolYearId');
	},

	active: function(id) {
		if (FlowRouter.getParam('selectedSubjectId') === id || FlowRouter.getParam('selectedSchoolWorkId') === id) {
			return true;
		}
		return false;
	},

	getType: function(workType, type) {
		if (workType === type) {
			return true;
		}
		return false;
	},

	getWork: function(subjectId) {
		return SchoolWork.find({subjectId: subjectId});
	},

	hasWork: function(subjectId) {
		if (SchoolWork.find({subjectId: subjectId}).count()) {
			return true;
		}
		return false;
	},

	isInSubject: function(subjectId, workSubjectId) {
		if (subjectId === workSubjectId) {
			return true;
		}
		return false;
	},

	activeRoute: function(currentRoute, route) {
		if (currentRoute === route) {
			return true;
		}
		return false;
	},
});

Template.schoolWorkEach.events({
	'click .js-add-to-subject-btn, click .js-remove-from-subject-btn'(event) {
		event.preventDefault();

		const workProperties = {
			_id: $(event.currentTarget).attr('data-work-id'),
			subjectId: $(event.currentTarget).attr('id')
		};

		Meteor.call('updateSchoolWorkSubject', workProperties, function(error, result) {
			if (error) {
				Alerts.insert({
					colorClass: 'bg-danger',
					iconClass: 'icn-danger',
					message: error.reason,
				});
			} else {
				if (workProperties.subjectId.length) {
					let subject = '#' + workProperties.subjectId + '.js-subject ';
					let listClass = '.js-' + workProperties.subjectId;
					
					$(subject).addClass('js-open');
					$(subject).find('.js-caret-right').hide();
					$(subject).find('.js-caret-down').show();
					$(listClass).slideDown(200);
				}
				FlowRouter.go('/planning/work/view/2/' + Session.get('selectedStudentId') +'/'+ Session.get('selectedSchoolYearId') +'/'+ workProperties._id);
			}
		})
	},

	'click .js-subject-toggle'(event) {
		event.preventDefault();
		event.stopPropagation();
		let listClass = '.js-' + $(event.currentTarget).attr('data-subject-index');

		if ($(event.currentTarget).hasClass('js-open')) {
			$(event.currentTarget).removeClass('js-open');
			$(event.currentTarget).find('.js-caret-right').show();
			$(event.currentTarget).find('.js-caret-down').hide();
			$(listClass).slideUp(100);
		} else {
			$(event.currentTarget).addClass('js-open');
			$(event.currentTarget).find('.js-caret-right').hide();
			$(event.currentTarget).find('.js-caret-down').show();
			$(listClass).slideDown(200);
		}
	},
});



