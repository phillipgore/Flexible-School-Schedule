import {Template} from 'meteor/templating';
import { Stats } from '../../../api/stats/stats.js';
import { SchoolYears } from '../../../api/schoolYears/schoolYears.js';
import { SchoolWork } from '../../../api/schoolWork/schoolWork.js';
import { Lessons } from '../../../api/lessons/lessons.js';
import { Terms } from '../../../api/terms/terms.js';
import { Weeks } from '../../../api/weeks/weeks.js';
import { Notes } from '../../../api/notes/notes.js';
import {weekdayLabels, weekdayLabelsShort} from '../../../modules/functions';

import moment from 'moment';
import _ from 'lodash'
import './trackingEditSchoolWork.html';

Template.trackingEditSchoolWork.helpers({
	workLessons: function(schoolWorkId) {
		return Lessons.find({schoolWorkId: schoolWorkId, weekId: FlowRouter.getParam('selectedWeekId'), studentId: FlowRouter.getParam('selectedStudentId')});
	},

	insertableWorkLessons: function(schoolWorkId) {
		let checkWeekDay = (weekDay, index) => {
			if (weekDay === 0 || weekDay === undefined) {
				return {weekDay: index + 1, hadWeekDay: false};
			}
			return {weekDay: weekDay, hadWeekDay: true};
		};

		let workLessons = Lessons.find({schoolWorkId: schoolWorkId, weekId: FlowRouter.getParam('selectedWeekId'), studentId: FlowRouter.getParam('selectedStudentId')}).fetch();
		workLessons.forEach((lesson, index) => {
			let weekDay = checkWeekDay(lesson.weekDay, index);
			lesson.weekDay = weekDay.weekDay
			lesson.hadWeekDay = weekDay.hadWeekDay
		});

		let weekDaysExist = (schoolWork) => {
			if (schoolWork.scheduledDays && schoolWork.scheduledDays[0].days && schoolWork.scheduledDays[0].days.length) {
				return true;
			}
			return false;
		}
		
		let days = [1, 2, 3, 4, 5, 6, 7];
		let workLessonDays = workLessons.map(lesson => parseInt(lesson.weekDay));
		let addDays = _.difference(days, workLessonDays);
		let schoolWork = SchoolWork.findOne({_id: schoolWorkId}, {fields: {scheduledDays: 1}});
		let hadWeekDay = weekDaysExist(schoolWork); 

		addDays.forEach(weekDay => {
			workLessons.push({_id: Random.id(), weekDay: weekDay, hadWeekDay: hadWeekDay, schoolWorkId: schoolWorkId, new: true});
		})

		return _.sortBy(workLessons, ['weekDay']);
	},

	workLessonsExist: function(schoolWorkId) {
		let lessonsCount = Lessons.find({schoolWorkId: schoolWorkId, weekId: FlowRouter.getParam('selectedWeekId'), studentId: FlowRouter.getParam('selectedStudentId')}).count();
		if (lessonsCount) {
			return true;
		}
		return false;
	},

	lessonCount: function(schoolWorkId) {
		return Lessons.find({schoolWorkId: schoolWorkId, weekId: FlowRouter.getParam('selectedWeekId'), studentId: FlowRouter.getParam('selectedStudentId')}).count()
	},

	lessonStatus: function(lesson, schoolWorkId) {
		$('.js-lesson-updating').hide();
		let lessons = Lessons.find({schoolWorkId: schoolWorkId, weekId: FlowRouter.getParam('selectedWeekId'), studentId: FlowRouter.getParam('selectedStudentId')}).fetch();

		if (!_.some(lessons, ['completed', false])) {
			return 'btn-primary-light';
		}
		if (lesson.completed) {
			return 'btn-secondary-light';
		}
		if (lesson.assigned) {
			return 'btn-warning-light';
		}

		return 'btn-gray-dark';
	},

	hasNote: function(schoolWorkId) {
		let note = Notes.findOne({schoolWorkId: schoolWorkId, weekId: FlowRouter.getParam('selectedWeekId')}) && Notes.findOne({schoolWorkId: schoolWorkId, weekId: FlowRouter.getParam('selectedWeekId')})
		if (_.isUndefined(note)) {
			return false
		}
		if (note.note) {
			return true;
		}
		return false;
	},

	isEdit: function() {
		let action = Session.get('action')
		if (action === 'choose' || action === 'labels') {
			return false;
		}
		return true;
	},

	isInsert: function() {
		let action = Session.get('action')
		if (action === 'insert' && action != 'labels') {
			return true;
		}
		return false;
	},

	isLabels: function() {
		let action = Session.get('action')
		if (action === 'labels') {
			return true;
		}
		return false;
	},

	daysOfWeek: function() {
		return [0, 1, 2, 3, 4, 5, 6, 7]
	},

	isSelected: function(selection, value) {
		if (parseInt(selection) === 0 && _.isUndefined(value)) {
			return true;
		}
		if (parseInt(selection) === parseInt(value)) {
			return true;
		}
		return false;
	},

	weekDayLabelMargin: function(schoolWorkId) {
		let lessonCount = Lessons.find({schoolWorkId: schoolWorkId, weekId: FlowRouter.getParam('selectedWeekId'), studentId: FlowRouter.getParam('selectedStudentId')}).count();
		let windowWidth = Session.get('windowWidth');

		if (windowWidth < 480) {
			if (lessonCount === 7) return '-7px';
			if (lessonCount === 6 || lessonCount === 5) return '-5px';
			return 0;
		}
		if (windowWidth >= 480 && windowWidth < 640) {
			if (lessonCount === 7) return '-2px';
			return 0;
		}
		if (windowWidth >= 640 && windowWidth < 768) {
			if (lessonCount === 7) return '-8px';
			if (lessonCount === 6 || lessonCount === 5) return '-5px';
			return 0;
		}
		if (windowWidth >= 768 && windowWidth < 896) {
			if (lessonCount === 7) return '-8px';
			if (lessonCount === 6) return '-5px';
			return 0;
		}
		if (windowWidth >= 896 && windowWidth < 1112) {
			if (lessonCount === 7) return '-8px';
			if (lessonCount === 6) return '-6px';
			if (lessonCount === 5) return '-5px';
			return 0;
		}
		if (windowWidth >= 1112) {
			if (lessonCount === 7) return '-5px';
			if (lessonCount === 6) return '-2px';
			return 0;
		}
	},

	weekDayLabel: function(day, schoolWorkId) {
		let lessonCount = Lessons.find({schoolWorkId: schoolWorkId, weekId: FlowRouter.getParam('selectedWeekId'), studentId: FlowRouter.getParam('selectedStudentId')}).count();
		let windowWidth = Session.get('windowWidth');

		if (windowWidth < 480) {
			if (lessonCount === 6 || lessonCount === 7) return weekdayLabelsShort(day);
			return weekdayLabels(day);
		}
		if (windowWidth >= 480 && windowWidth < 640) {
			return weekdayLabels(day);
		}
		if (windowWidth >= 640 && windowWidth < 768) {
			if (lessonCount === 6 || lessonCount === 7) return weekdayLabelsShort(day);
			return weekdayLabels(day);
		}
		if (windowWidth >= 768 && windowWidth < 896) {
			return weekdayLabels(day);
		}
		if (windowWidth >= 896 && windowWidth < 1112) {
			if (lessonCount === 6 || lessonCount === 7) return weekdayLabelsShort(day);
			return weekdayLabels(day);
		}
		if (windowWidth >= 1112) {
			return weekdayLabels(day);
		}
	},
});

Template.trackingEditSchoolWork.events({
	'change .js-checkbox'(event) {
	    if ($(event.currentTarget).val() === 'true') {
	    	$(event.currentTarget).val('false');
	    } else {
	    	$(event.currentTarget).val('true');
	    }
	},

	'click .js-has-notes'(event) {
		event.preventDefault();
		return false;
	}
});





