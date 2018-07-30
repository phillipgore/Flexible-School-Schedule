import {Template} from 'meteor/templating';
import { Students } from '../../../api/students/students.js';
import { SchoolYears } from '../../../api/schoolYears/schoolYears.js';
import { Resources } from '../../../api/resources/resources.js';
import { SchoolWork } from '../../../api/schoolWork/schoolWork.js';
import { Terms } from '../../../api/terms/terms.js';
import { Weeks } from '../../../api/weeks/weeks.js';
import { Lessons } from '../../../api/lessons/lessons.js';

import moment from 'moment';
import autosize from 'autosize';
import './trackingSchoolWork.html';

	
Template.trackingSchoolWork.helpers({
	schoolWorkInfoReady: function() {
		return Session.get('schoolWorkInfoReady');
	},

	resources: function(resourceIds) {
		return Resources.find({_id: {$in: resourceIds}});
	},

	terms: function() {
		return Terms.find({schoolYearId: FlowRouter.getParam('selectedSchoolYearId')}, {sort: {order: 1}});
	},

	selectedTerm: function() {
		return Terms.findOne({_id: FlowRouter.getParam('selectedTermId')});
	},

	weeks: function() {
		return Weeks.find({termId: FlowRouter.getParam('selectedTermId')}, {sort: {order: 1}});
	},

	selectedWeek: function() {
		return Weeks.findOne({_id: FlowRouter.getParam('selectedWeekId')});
	},

	lessons: function(schoolWorkId) {
		return Lessons.find({weekId: FlowRouter.getParam('selectedWeekId'), schoolWorkId: schoolWorkId}, {sort: {order: 1}});
	},

	lessonCount: function(schoolWorkId) {
		return Lessons.find({weekId: FlowRouter.getParam('selectedWeekId'), schoolWorkId: schoolWorkId}).count();
	},

	lessonPosition: function(schoolWorkId, lessonId) {
		let lessonIds = Lessons.find({weekId: FlowRouter.getParam('selectedWeekId'), schoolWorkId: schoolWorkId}, {sort: {order: 1}}).map(lesson => (lesson._id))
		return Lessons.find() && lessonIds.indexOf(lessonId);
	},

	todaysDate: function() {
		return moment();
	},

	lessonStatus: function(lessonAssigned, lessonCompleted, schoolWorkId) {
		let lessonsIncompleteCount = Lessons.find({weekId: FlowRouter.getParam('selectedWeekId'), schoolWorkId: schoolWorkId, completed: false}, {sort: {order: 1}}).count()
		if (!lessonsIncompleteCount && lessonCompleted) {
			return 'btn-primary';
		}
		if (lessonCompleted) {
			return 'btn-secondary';
		}
		if (lessonAssigned) {
			return 'btn-warning';
		}
		return '';
	},
});

Template.trackingSchoolWork.events({
	'click .js-show-schoolWork-info'(event) {
		event.preventDefault();

		$('.js-schoolWork-track').removeClass('active');
		$('.js-lesson-input').removeAttr('style');

		let schoolWorkId = $(event.currentTarget).attr('id');
		$('.js-label-' + schoolWorkId).toggle();
		$('.js-' + schoolWorkId).toggle();
	},

	'click .js-lesson-btn'(event) {
		event.preventDefault();

		$('.js-hide, .js-info').hide();
		$('.js-show').show();

		let schoolWorkId = $(event.currentTarget).attr('data-schoolWork-id');
		let lessonId = $(event.currentTarget).attr('data-lesson-id');
		Session.set('lessonScrollTop', $('#js-schoolWork-track-' + schoolWorkId).offset().top - 80);

		$('.js-lesson-input').removeAttr('style');
		$('#js-schoolWork-track-' + schoolWorkId).addClass('active');
		$('.js-schoolWork-track').not('.active').addClass('inactive');

		$('#' + lessonId).show();
		$(window).scrollTop(0);

		$('#completed-on-' + lessonId).pickadate({
			format: 'mmmm d, yyyy',
			today: 'Today',
			clear: 'Clear',
			close: 'Close',
		});
	},

	'click .js-close'(event) {
		event.preventDefault();

		$('.js-schoolWork-track').removeClass('active');
		$('.js-schoolWork-track').removeClass('inactive');
		$('.js-lesson-input').removeAttr('style');
		if ($(window).width() < 640) {
			$(window).scrollTop(Session.get('lessonScrollTop'));
		}
	},

	'change .js-completed-checkbox, change .js-assigned-checkbox'(event) {
	    if ($(event.currentTarget).val() === 'true') {
	    	$(event.currentTarget).val('false');
	    } else {
	    	$(event.currentTarget).val('true');
	    }
	},

	'submit .js-form-lessons-update'(event) {
		event.preventDefault();

		let lessonId = $(event.currentTarget).parent().attr('id');
		$('[data-lesson-id="' + lessonId + '"]').find('.js-lesson-updating').show();

		$('.js-schoolWork-track').removeClass('active');
		$('.js-schoolWork-track').removeClass('inactive');
		$('.js-lesson-input').removeAttr('style');
		if ($(window).width() < 640) {
			$(window).scrollTop(Session.get('lessonScrollTop'));
		}

		let lessonPoperties = {
			_id: $(event.currentTarget).parent().attr('id'),
			assigned: event.currentTarget.assigned.value.trim() === 'true',
			completed: event.currentTarget.completed.value.trim() === 'true',
			completedOn: event.currentTarget.completedOn.value.trim(),
			completionTime: event.currentTarget.completionTime.value.trim(),
			description: Session.get($(event.currentTarget).find('.editor-content').attr('id')),
		}

		Meteor.call('updateLesson', lessonPoperties, function(error, result) {
			if (error) {
				Alerts.insert({
					colorClass: 'bg-danger',
					iconClass: 'fss-danger',
					message: error.reason,
				});
				
				$('.js-lesson-updating').hide();
			} else {
				$('.js-lesson-updating').hide();
			}
		});

		return false;
	},
});