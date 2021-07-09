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

	subjectWorkExist: function(subjectId) {
		if (subjectId === 'noSubject') {
			return SchoolWork.find({subjectId: {$exists: false}, schoolYearId: FlowRouter.getParam('selectedSchoolYearId'), studentId: FlowRouter.getParam('selectedStudentId')}).count();
		}
		return SchoolWork.find({subjectId: subjectId, schoolYearId: FlowRouter.getParam('selectedSchoolYearId'), studentId: FlowRouter.getParam('selectedStudentId')}).count();
	},

	subjectWork: function(subjectId) {
		if (subjectId === 'noSubject') {
			let work = SchoolWork.find({subjectId: {$exists: false}, schoolYearId: FlowRouter.getParam('selectedSchoolYearId'), studentId: FlowRouter.getParam('selectedStudentId')}, {sort: {name: 1}}).fetch();
			work.forEach(work => {
				let notes = Notes.findOne({schoolWorkId: work._id});
				if (notes) {
					work.note = notes.note;
				}
			})
			return work;
		}
		let work = SchoolWork.find({subjectId: subjectId, schoolYearId: FlowRouter.getParam('selectedSchoolYearId'), studentId: FlowRouter.getParam('selectedStudentId')}, {sort: {name: 1}}).fetch();
		work.forEach(work => {
			let notes = Notes.findOne({schoolWorkId: work._id});
			if (notes) {
				work.note = notes.note;
			}
		})
		return work;
	},

	workLessons: function(schoolWorkId) {
		return Lessons.find({schoolWorkId: schoolWorkId, weekId: FlowRouter.getParam('selectedWeekId'), studentId: FlowRouter.getParam('selectedStudentId')}, {order: {order: 1, weekDay: 1}});
	},

	insertableWorkLessons: function(schoolWorkId) {
		let checkWeekDay = (weekDay, index) => {
			if (weekDay === 0 || weekDay === undefined) {
				return {weekDay: index + 1, hadWeekDay: false};
			}
			return {weekDay: parseInt(weekDay), hadWeekDay: true};
		};

		let workLessons = Lessons.find({
			schoolWorkId: schoolWorkId, 
			weekId: FlowRouter.getParam('selectedWeekId'), 
			studentId: FlowRouter.getParam('selectedStudentId')
		}, {
			order: {order: 1, weekDay: 1}
		}).fetch();

		workLessons.forEach((lesson, index) => {
			let weekDay = checkWeekDay(lesson.weekDay, index);
			lesson.weekDay = weekDay.weekDay;
			lesson.order = weekDay.weekDay;
			lesson.hadWeekDay = weekDay.hadWeekDay;
		});

		let workLessonCount = workLessons.length;
		let workLessonWeekDays = workLessons.map(lesson => lesson.weekDay).filter(weekday => weekday !== undefined);

		let orders = [1, 2, 3, 4, 5, 6, 7];
		let workLessonOrders = _.uniq(workLessons.map(lesson => parseInt(lesson.order)));
		let addOrders = _.difference(orders, workLessonOrders);

		addOrders.forEach(order => {
			workLessons.push({
				_id: Random.id(), 
				order: parseInt(order),
				weekDay: parseInt(order),
				hadWeekDay: false, 
				schoolWorkId: 
				schoolWorkId, 
				new: true
			});
		});

		_.orderBy(workLessons, ['hadWeekDay'], ['desc'])
		workLessons.length = 7;

		return _.sortBy(workLessons, ['weekDay', 'order']);
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

	isWeekDay: function(weekDay) {
		if (weekDay === 0 || weekDay === '0' || weekDay === undefined) {
			return false;
		}
		return true;
	},

	getstatus: function(lessonId) {
		let doNextLesson = Lessons.findOne({_id: lessonId});

		if (doNextLesson.completed) {
			return 'completed'
		}
		if (doNextLesson.assigned) {
			return 'next'
		}
		return 'open';
	}
});

Template.trackingEditSchoolWork.events({
	'change .js-checkbox'(event) {
	    if ($(event.currentTarget).val() === 'true') {
	    	$(event.currentTarget).val('false');
	    	$('.js-check-multiple-all').val('false').prop('checked', false);
	    } else {
	    	$(event.currentTarget).val('true');
			if ($('.js-segment-checkbox').length === $('.js-segment-checkbox:checked').length) {
				$('.js-check-multiple-all').val('true').prop('checked', true);
			}
	    }
	},

	'click .js-has-notes'(event) {
		event.preventDefault();
		return false;
	}
});





