import {Template} from 'meteor/templating';
import { SchoolWork } from '../../../api/schoolWork/schoolWork.js';
import { Notes } from '../../../api/notes/notes.js';
import { Lessons } from '../../../api/lessons/lessons.js';
import { Terms } from '../../../api/terms/terms.js';
import { Weeks } from '../../../api/weeks/weeks.js';

import {saveNote} from '../../../modules/functions';

import moment from 'moment';
import _ from 'lodash'

import './trackingSchoolWork.html';

Template.trackingSchoolWork.helpers({
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

	isType: function(isType, type) {
		if (isType === type) {
			return true;
		}
		return false;
	},

	subjectSpacing: function(subject, index) {
		if (index === 0) {
			return 'p-tn-t-30';
		}
		if (subject.precededByWork) {
			return 'p-tn-t-54';
		}
		return 'p-tn-t-30';
	},

	workLessons: function(schoolWorkId) {
		return Lessons.find({studentId: FlowRouter.getParam('selectedStudentId'), schoolWorkId: schoolWorkId, weekId: FlowRouter.getParam('selectedWeekId')}, {sort: {order: 1, weekDay: 1}});
	},

	workLessonsExist: function(schoolWorkId) {
		let lessonsCount = Lessons.find({schoolWorkId: schoolWorkId, weekId: FlowRouter.getParam('selectedWeekId')}).count();
		if (lessonsCount) {
			return true;
		}
		return false;
	},

	lessonCount: function(schoolWorkId) {
		return Lessons.find({studentId: FlowRouter.getParam('selectedStudentId'), schoolWorkId: schoolWorkId, weekId: FlowRouter.getParam('selectedWeekId')}).count();
	},

	lessonPosition: function(schoolWorkId, lessonId) {
		let lessonIds = Lessons.find({studentId: FlowRouter.getParam('selectedStudentId'), schoolWorkId: schoolWorkId, weekId: FlowRouter.getParam('selectedWeekId')}, {sort: {order: 1, weekDay: 1}}).map(lesson => (lesson._id))
		return lessonIds.indexOf(lessonId);
	},

	todaysDate: function() {
		return moment();
	},

	workInfo: function() {
		return Session.get('schoolWorkInfo');
	},

	lessonInfo: function() {
		return Session.get('lessonInfo');
	},

	lessonStatus: function(lesson, schoolWorkId) {
		$('.js-lesson-updating').hide();
		$('.js-lesson-weekday-label').show();
		let lessons = Lessons.find({studentId: FlowRouter.getParam('selectedStudentId'), schoolWorkId: schoolWorkId, weekId: FlowRouter.getParam('selectedWeekId')}).fetch();

		if (!_.some(lessons, ['completed', false])) {
			return 'btn-primary';
		}
		if (lesson.completed) {
			return 'btn-secondary';
		}
		if (lesson.assigned) {
			return 'btn-warning';
		}

		return 'txt-gray-darkest';
	},

	hasNote: function(schoolWorkId) {
		let schoolWork = SchoolWork.findOne({_id: schoolWorkId}) && SchoolWork.findOne({_id: schoolWorkId})
		if (_.isUndefined(schoolWork.note)) {
			return false
		}
		if (schoolWork.note) {
			return true;
		}
		return false;
	},

	workNote: function() {
		return Session.get('schoolWorkNote');
	}
});

Template.trackingSchoolWork.events({
	'click .js-show-schoolWork-notes'(event) {
		event.preventDefault();

		let openSchoolWorkId = $('.js-notes.js-open').attr('data-work-id');

		if (Session.get('hasChanged')) {
			saveNote(openSchoolWorkId)
		}

		$('.js-info, .js-notes, .js-btn-go-to').hide()
		$('.js-info').removeClass('js-open');
		$('.js-editor-btn').removeClass('active');

		let schoolWorkId = $(event.currentTarget).attr('id');

		if ($('.js-notes-' + schoolWorkId).hasClass('js-open')) {
			$('.js-notes-' + schoolWorkId).removeClass('js-open');
		} else {
			$('.js-notes').removeClass('js-open');

			$('.js-work-track').removeClass('active');
			$('.js-lesson-input').removeAttr('style');
			$('.js-notes-' + schoolWorkId).show().addClass('js-open');
		}		
	},

	'keyup .js-notes-editor, click .js-editor-btn': function(event) {
		Session.set('hasChanged', true);
	},

	'click .js-show-schoolWork-info'(event) {
		event.preventDefault();

		$('.js-info, .js-notes').hide()
		$('.js-notes').removeClass('js-open');
		Session.set('schoolWorkInfo', {description: '', resources: []});
		
		let schoolWorkId = $(event.currentTarget).attr('id');
		$('.js-info-data-' + schoolWorkId).hide();
		$('.js-info-loader-' + schoolWorkId).show();

		if ($('.js-info-' + schoolWorkId).hasClass('js-open')) {
			$('.js-info-' + schoolWorkId).removeClass('js-open')
		} else {
			$('.js-info').removeClass('js-open');

			$('.js-work-track').removeClass('active');
			$('.js-lesson-input').removeAttr('style');
			$('.js-info-' + schoolWorkId).show().addClass('js-open');

			Meteor.call('getSchoolWorkInfo', schoolWorkId, function(error, result) {
				Session.set('schoolWorkInfo', result);

				$('.js-info-loader-' + schoolWorkId).hide();
				$('.js-info-data-' + schoolWorkId).show();
			})
		}		
	},

	'click .js-lesson-btn'(event) {
		event.preventDefault();

		if ($(window).width() < 640) {
			$('.navbar').hide();
		}
		$('.js-info, .js-notes').hide();
		$('.js-show-schoolWork-info, .js-show-schoolWork-notes').addClass('js-closed');

		Session.set('schoolWorkInfo', {description: '', resources: []});
		Session.set('lessonInfo', null);

		let schoolWorkId = $(event.currentTarget).attr('data-schoolWork-id');
		let lessonId = $(event.currentTarget).attr('data-lesson-id');
		Session.set('lessonScrollTop', $('#js-work-track-' + schoolWorkId).offset().top - 80);

		$('.js-lesson-input').removeAttr('style');
		$('#js-work-track-' + schoolWorkId).addClass('active');
		$('.js-work-track').not('.active').addClass('inactive');

		$('#' + lessonId).show();
		$(window).scrollTop(0);

		$('#completed-on-' + lessonId).pickadate({
			format: 'mmmm d, yyyy',
			today: 'Today',
			clear: 'Clear',
			close: 'Close',
		});

		Meteor.call('getLesson', lessonId, function(error, result) {
			Session.set('lessonInfo', result);

			$('.js-loader-' + lessonId).hide();
			$('.js-info-' + lessonId).show();
		});
	},

	'click .js-close'(event) {
		event.preventDefault();

		$('.navbar').show();
		$('.js-work-track').removeClass('active');
		$('.js-work-track').removeClass('inactive');
		$('.js-lesson-input').removeAttr('style');
		if ($(window).width() < 640) {
			$(window).scrollTop(Session.get('lessonScrollTop'));
		}
		Session.set('lessonInfo', null);
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
		$('[data-lesson-id="' + lessonId + '"]').find('.js-lesson-weekday-label').hide();

		$('.navbar').show();
		$('.js-work-track').removeClass('active');
		$('.js-work-track').removeClass('inactive');
		$('.js-lesson-input').removeAttr('style');
		if ($(window).width() < 640) {
			$(window).scrollTop(Session.get('lessonScrollTop'));
		}

		let lessonProperties = {
			_id: $(event.currentTarget).parent().attr('id'),
			assigned: event.currentTarget.assigned.value.trim() === 'true',
			completed: event.currentTarget.completed.value.trim() === 'true',
			completedOn: event.currentTarget.completedOn.value.trim(),
			completionTime: event.currentTarget.completionTime.value.trim(),
			description: $('#' + $(event.currentTarget).find('.editor-content').attr('id')).html(),
		}

		if (_.has(lessonProperties, 'completedOn')) {
			lessonProperties.completedOn = moment(lessonProperties.completedOn).toISOString();
		}

		let pathProperties = {
			studentIds: [FlowRouter.getParam('selectedStudentId')],
			schoolYearIds: [FlowRouter.getParam('selectedSchoolYearId')],
			termIds: [FlowRouter.getParam('selectedTermId')],
		}

		let statProperties = {
			studentIds: [FlowRouter.getParam('selectedStudentId')],
			schoolYearIds: [FlowRouter.getParam('selectedSchoolYearId')],
			termIds:[FlowRouter.getParam('selectedTermId')],
			weekIds:[FlowRouter.getParam('selectedWeekId')],
		}

		Meteor.call('updateLesson', statProperties, pathProperties, lessonProperties, function(error, result) {
			if (error) {
				Alerts.insert({
					colorClass: 'bg-danger',
					iconClass: 'icn-danger',
					message: error.reason,
				});
				$('.js-lesson-updating').hide();
				$('.js-lesson-weekday-label').show();
			} else {
				$('.js-lesson-updating').hide();
				$('.js-lesson-weekday-label').show();
			}
		});

		return false;
	},
});

