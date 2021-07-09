import {Template} from 'meteor/templating';
import { Subjects } from '../../../../../api/subjects/subjects.js';
import { SchoolWork } from '../../../../../api/schoolWork/schoolWork.js';
import { Students } from '../../../../../api/students/students.js';
import { Resources } from '../../../../../api/resources/resources.js';
import { SchoolYears } from '../../../../../api/schoolYears/schoolYears.js';
import { Terms } from '../../../../../api/terms/terms.js';
import { Weeks } from '../../../../../api/weeks/weeks.js';
import { Lessons } from '../../../../../api/lessons/lessons.js';

import {requiredValidation} from '../../../../../modules/functions';
import _ from 'lodash'
import './workEdit.html';

LocalResources = new Mongo.Collection(null);

Template.workEdit.onCreated( function() {	
	// Subscriptions
	this.subjectData = this.subscribe('schooYearStudentSubject', FlowRouter.getParam('selectedSchoolYearId'), FlowRouter.getParam('selectedStudentId'));
	this.schoolWorkData = Meteor.subscribe('schoolWork', FlowRouter.getParam('selectedSchoolWorkId'), function() {
		Session.set('schoolYearId', SchoolWork.findOne({_id: FlowRouter.getParam('selectedSchoolWorkId')}).schoolYearId)
	});
	this.studentData = Meteor.subscribe('allStudents');
	this.schoolYearData = Meteor.subscribe('allSchoolYears');
	this.termData = Meteor.subscribe('allTerms');
	this.weekData = Meteor.subscribe('allWeeks');
	this.lessonData = Meteor.subscribe('schoolWorkLessons', FlowRouter.getParam('selectedSchoolWorkId'));

	let template = Template.instance();

	template.schoolWorkId = new ReactiveVar(FlowRouter.getParam('selectedSchoolWorkId'))
	template.searchQuery = new ReactiveVar();
	template.searching   = new ReactiveVar( false );
	template.timesPerWeek = new ReactiveVar();
	template.existingScheduledDays = new ReactiveVar();
	template.scheduledDays = new ReactiveVar();

	template.autorun( () => {
		template.subscribe('schoolWorkResources', template.schoolWorkId.get(), () => {
	    	LocalResources.remove({});
			Resources.find().forEach(function(resource) {
				LocalResources.insert({id: resource._id, type: resource.type, title: resource.title});
			});
			template.schoolWorkId.set('');
	    })
	})

	template.autorun( () => {
		template.subscribe( 'searchResources', template.searchQuery.get(), () => {
		  setTimeout( () => {
		    template.searching.set( false );
		  }, 500 );
		});
	});
});

Template.workEdit.onRendered( function() {
	Session.set({
		toolbarType: 'edit',
		labelThree: 'Edit School Work',
		activeNav: 'planningList',
	});
});

Template.workEdit.helpers({
	subscriptionReady: function() {
		if (Template.instance().subjectData.ready() && Template.instance().schoolWorkData.ready() && Template.instance().studentData.ready() && Template.instance().schoolYearData.ready() && Template.instance().termData.ready() && Template.instance().weekData.ready() && Template.instance().lessonData.ready()) {
			let getScheduledDays = () => {
				let schoolWork = SchoolWork.findOne({_id: FlowRouter.getParam('selectedSchoolWorkId')});
				if (schoolWork.scheduledDays) {
					return schoolWork.scheduledDays;
				}
				
				let scheduledDays = []; 
				let weekLessonCounts = []
				let weeks = Weeks.find({schoolYearId: FlowRouter.getParam('selectedSchoolYearId')}).fetch();
				weeks.forEach(function(week) {
					weekLessonCounts.push(Lessons.find({weekId: week._id, schoolWorkId: FlowRouter.getParam('selectedSchoolWorkId')}).count());
				})
				_.uniq(weekLessonCounts).forEach(function(count) {
					if (count && count != 0 && count != '0') {
						scheduledDays.push({segmentCount: count, days: []})
					}
				})

				return scheduledDays
			}
			
			let scheduledDays = getScheduledDays()
			Template.instance().timesPerWeek.set(scheduledDays.map(scheduled => scheduled.segmentCount));
			Template.instance().existingScheduledDays.set(scheduledDays)
			Template.instance().scheduledDays.set(scheduledDays);

			return true;
		}
	},

	subjects: function() {
		return Subjects.find({}, {sort: {name: 1}});
	},

	subjectIsSelected: function(subjectId) {
		let getSubjectId = () => {
			let schoolWork = SchoolWork.findOne({_id: FlowRouter.getParam('selectedSchoolWorkId')});
			if (schoolWork && schoolWork.subjectId) {
				return schoolWork.subjectId;
			}
			return 'noSubject';
		}

		if (subjectId === getSubjectId()) {
			return 'selected';
		}

		return null;
	},
	
	selectedSchoolWork: function() {
		return SchoolWork.findOne({_id: FlowRouter.getParam('selectedSchoolWorkId')});
	},

	selectedStudent: function() {
		return Students.findOne({_id: FlowRouter.getParam('selectedStudentId')});
	},

	selectedSchoolYear: function() {
		return SchoolYears.findOne({_id: FlowRouter.getParam('selectedSchoolYearId')});
	},

	terms: function() {
		return Terms.find({schoolYearId: FlowRouter.getParam('selectedSchoolYearId')}, {sort: {order: 1}});
	},

	weeks: function(termId) {
        return Weeks.find({termId: termId});
	},

	weekCount: function(termId) {
        return Weeks.find({termId: termId}).count();
	},

	isSelected: function(termId, value) {
		let weekIds = Weeks.find({termId: termId}).map(week => (week._id));
		let lessonCounts = [];
		weekIds.forEach(function(weekId) {
			lessonCounts.push(Lessons.find({weekId: weekId, schoolWorkId: FlowRouter.getParam('selectedSchoolWorkId')}).count());
		})

		if (_.uniq(lessonCounts).length === 1) {
			if (value === lessonCounts[0]) {
				$('#' + termId + ' .js-option-random').remove();
				return 'selected';
			};
		}
		return null;
	},

	isRandom: function(termId) {
		let weekIds = Weeks.find({termId: termId}).map(week => (week._id));
		let lessonCounts = [];
		weekIds.forEach(function(weekId) {
			lessonCounts.push(Lessons.find({weekId: weekId, schoolWorkId: FlowRouter.getParam('selectedSchoolWorkId')}).count());
		})

		if (_.uniq(lessonCounts).length === 1) {
			return false;
		}
		return true;
	},

	lessonCount: function(weekId) {
        return Lessons.find({weekId: weekId, schoolWorkId: FlowRouter.getParam('selectedSchoolWorkId')}).count();
	},

	lessonCompleteCount: function(weekId) {
        return Lessons.find({weekId: weekId, completed: true, schoolWorkId: FlowRouter.getParam('selectedSchoolWorkId')}).count();
	},

	lessonIncompleteCount: function(weekId) {
        return Lessons.find({weekId: weekId, completed: false, schoolWorkId: FlowRouter.getParam('selectedSchoolWorkId')}).count();
	},

	searching() {
		return Template.instance().searching.get();
	},

	query() {
		return Template.instance().searchQuery.get();
	},

	resources() {
		let resources = Resources.find();
		if (resources) {
			return resources;
		}
	},

	localResources() {
		return LocalResources.find();
	},

	scheduledDays: function() {
		return Template.instance().scheduledDays.get();
	},

	isSeven: function(times) {
		if (times === 7) {
			return true;
		}
		return false;
	},

	isDisabled: function(scheduleDays, day) {
		if (scheduleDays.days.length && scheduleDays.segmentCount === 0 || scheduleDays.days.length && scheduleDays.days.indexOf(parseInt(day)) < 0) {
			return true;
		}
		return false;
	},

	isChecked: function(days, day) {
		if (days.indexOf(parseInt(day)) >= 0) {
			return true;
		}
		return false;
	}
});

Template.workEdit.events({
	'change .js-school-year-id'(event) {
		Session.set({schoolYearId: event.currentTarget.value})
	},

	'change .js-times-per-week-preset'(event, template) {
		$(event.currentTarget).parentsUntil('.js-times-per-week-container').parent().find('.js-times-per-week').each(function() {
			let completeLessons = $(this).attr('data-lesson-complete-count');
			let newLessons = event.currentTarget.value;
			let termOrder = $(this).parentsUntil('.js-times-per-week-container').parent().attr('data-term-order')

			if (newLessons < completeLessons && completeLessons > 0) {
				$(this).addClass('error');
				$(this).parent().find('.js-times-per-week-errors').text('Min ' + completeLessons + '.').show();
				$('.js-submit').prop('disabled', true);
				$('.js-label-' + termOrder +'.js-label-show').hide();
				$('.js-label-' + termOrder +'.js-label-hide').show();
				$('.js-' + termOrder + '.js-weeks-input').slideDown('fast');
			} else {
				$(this).removeClass('error');
				$(this).parent().find('.js-times-per-week-errors').text('');
				$('.js-submit').prop('disabled', false);
			}
		})
		$('#' + event.currentTarget.dataset.termId).find('.js-times-per-week').val(event.currentTarget.value);
	},


	'keypress .js-times-per-week'(event) {
		let allowedKeys = [49, 50, 51, 52, 53, 54, 55, 56, 57];
		let keyCode = event.which || event.keyCode;
		
		if (allowedKeys.indexOf(keyCode) < 0) {
			event.preventDefault();
		}
	},

	'change .js-times-per-week'(event) {
		$('#' + event.currentTarget.dataset.termId + ' .js-times-per-week-preset option').removeProp('selected');
		$('#' + event.currentTarget.dataset.termId + ' .js-times-per-week-preset option:disabled').prop('selected', true);
	},

	'keyup .js-times-per-week'(event, template) {
		let completeLessons = event.currentTarget.dataset.lessonCompleteCount;
		let newLessons = $(event.currentTarget).val();

		if (newLessons < completeLessons && completeLessons > 0) {
			$(event.currentTarget).addClass('error');
			$(event.currentTarget).parent().find('.js-times-per-week-errors').text('Min ' + completeLessons + '.').show();
			$('.js-submit').prop('disabled', true);
		} else {
			$(event.currentTarget).removeClass('error');
			$(event.currentTarget).parent().find('.js-times-per-week-errors').text('');
			$('.js-submit').prop('disabled', false);
		}

		let uniqValues = _.uniq(_.map(document.getElementById(event.currentTarget.dataset.termId).getElementsByClassName('js-times-per-week'), 'value'))
		let randomOption = document.getElementById(event.currentTarget.dataset.termId).getElementsByClassName('js-option-random').length
		
		if (uniqValues.length != 1 && !randomOption) {
			$('#' + event.currentTarget.dataset.termId + ' .js-times-per-week-preset option').removeProp('selected');
			$('#' + event.currentTarget.dataset.termId + ' .js-times-per-week-preset').prepend('<option class="js-option-random" disabled selected value>Random Segments Per Week</option>');
		} else if (uniqValues.length == 1) {
			$('#' + event.currentTarget.dataset.termId + ' .js-option-random').remove();
			if (!uniqValues[0]) {
				$('#' + event.currentTarget.dataset.termId + ' .js-times-per-week-preset option:first').prop('selected', true);
			} else {
				$('#' + event.currentTarget.dataset.termId + ' .js-times-per-week-preset option[value='+ uniqValues[0] +']').prop('selected', true);
			}
		}
	},

	'click .js-show-individual-weeks'(event) {
		event.preventDefault();
		let termOrder = $(event.currentTarget).attr('id');
		$('.js-label-' + termOrder).toggle();
		$('.js-' + termOrder).slideToggle('fast');
	},

	'click .js-remove-resource'(event) {
		event.preventDefault();

		Alerts.remove({type: 'addResource'});
		LocalResources.remove({id: event.currentTarget.id});
	},

	'keyup #search-resources'(event, template) {
		let value = event.currentTarget.value.trim();

		if ( value !== '' ) {
			template.searchQuery.set( value );
			template.searching.set( true );
		}

		if ( value === '' ) {
			template.searchQuery.set( value );
		}
	},

	'click .js-clear-search'(event, template) {
		event.preventDefault();

		Alerts.remove({type: 'addResource'});
		$('#search-resources').val('');
		template.searchQuery.set('');
		template.searching.set(false);
	},

	'click .js-add-resource'(event, template) {
		event.preventDefault();

		let resource = Resources.findOne({_id: event.currentTarget.id});
		let localResource = LocalResources.findOne({id: resource._id})
		if (localResource) {
			Alerts.insert({
				type: 'addResource',
				colorClass: 'bg-warning',
				iconClass: 'icn-warning',
				message: '"' +localResource.title + '" is already attached to this schoolWork.',
			});
		} else {
			LocalResources.insert({id: resource._id, type: resource.type, title: resource.title});

			Alerts.remove({type: 'addResource'});
			$('#search-resources').val('');
			template.searchQuery.set('');
			template.searching.set(false);
		}
	},

	'click .js-resource-btn'(event) {
		event.preventDefault();
		Session.set('selectedResourceNewType', event.currentTarget.id);
		Session.set('currentType', event.currentTarget.id);
		$('.js-resource-popover .js-resource-type').text(event.currentTarget.id);
		document.getElementsByClassName('js-resource-popover')[0].classList.remove('hide');
	},

	'click .js-step-circle, click .js-step-btn'(event, template) {
		event.preventDefault();

		let stepClass = $(event.currentTarget).attr('data-id');

		if (stepClass === 'js-step-one') {
			$('.js-step-circle').removeClass('bg-info');
			$('.js-circle-one').addClass('bg-info');

			$('.js-show').show();
			$('.js-hide').hide();
			$('.js-info').slideUp('fast');
			$('.js-show-help').removeClass('js-open').addClass('js-closed');

			$('.js-step').addClass('offpage');
			$('.' + stepClass).removeClass('offpage');
			$('.js-day-label-errors').text('');
		}
		if (stepClass === 'js-step-two') {
			if ( requiredValidation($("[name='name']").val().trim()) ) {
				$('#name').removeClass('error');
				$('.name-errors').text('');

				$('.js-step-circle').removeClass('bg-info');
				$('.js-circle-two').addClass('bg-info');

				$('.js-show').show();
				$('.js-hide').hide();
				$('.js-info').slideUp('fast');
				$('.js-show-help').removeClass('js-open').addClass('js-closed');

				$('.js-step').addClass('offpage');
				$('.' + stepClass).removeClass('offpage');
			} else {
				$('#name').addClass('error');
				$('.name-errors').text('Required.');
			}
			$('.js-day-label-errors').text('');
		}
		if (stepClass === 'js-step-three') {
			if ( requiredValidation($("[name='name']").val().trim()) ) {
				$('#name').removeClass('error');
				$('.name-errors').text('');

				$('.js-step-circle').removeClass('bg-info');
				$('.js-circle-three').addClass('bg-info');

				$('.js-show').show();
				$('.js-hide').hide();
				$('.js-info').slideUp('fast');
				$('.js-show-help').removeClass('js-open').addClass('js-closed');

				$('.js-step').addClass('offpage');
				$('.' + stepClass).removeClass('offpage');
			} else {
				$('#name').addClass('error');
				$('.name-errors').text('Required.');
			}
			$('.js-day-label-errors').text('');
		}
		if (stepClass === 'js-step-four') {
			if ($('.js-times-per-week').hasClass('error')) {
				Alerts.insert({
					colorClass: 'bg-danger',
					iconClass: 'icn-danger',
					message: 'Please resolve highlighted errors.',
				});
			} else {
				if ( requiredValidation($("[name='name']").val().trim()) ) {
					setScheduledDays(template);
					$('#name').removeClass('error');
					$('.name-errors').text('');

					$('.js-step-circle').removeClass('bg-info');
					$('.js-circle-four').addClass('bg-info');

					$('.js-show').show();
					$('.js-hide').hide();
					$('.js-info').slideUp('fast');
					$('.js-show-help').removeClass('js-open').addClass('js-closed');

					$('.js-step').addClass('offpage');
					$('.' + stepClass).removeClass('offpage');
				} else {
					$('#name').addClass('error');
					$('.name-errors').text('Required.');
				}
			}
		}
	},

	'change .js-day-labels-checkbox'(event) {
		event.preventDefault();
		let parent = $(event.currentTarget).parentsUntil('.js-day-labels-section').parent();
		let segmentCount = parseInt(parent.attr('data-segment-count'));
		let checkedCount = $(parent).find('input:checked').length;
		let unchecked = $(parent).find('input:checkbox:not(:checked)');

		if (segmentCount === checkedCount) {
			$('#day-labels-' + segmentCount).find('.js-day-label-errors').text('');
			$(unchecked).each(function() {
				$(this).prop('disabled', true);
			})
		} else {
			$(unchecked).each(function() {
				$(this).prop('disabled', false);
			})
		}
	},

	'click .js-day-labels-uncheck-all'(event) {
		event.preventDefault();
		let parent = $(event.currentTarget).parentsUntil('.js-day-labels-section').parent();
		$(parent).find('.js-day-labels-checkbox').prop({'checked': false, 'disabled': false});
	},

	'submit .js-form-school-work-update'(event, template) {
		event.preventDefault();

		let dayLabelCheck = () => {
			let checkedCount = $('.js-day-labels').find('input:checked').length;
			if (checkedCount) {
				let inError = []
				$('.js-day-label-errors').text('');
				template.timesPerWeek.get().forEach(times => {
					let id = '#day-labels-' + times;
					let checkedCount = $(id).find('input:checked').length
					let pluralize = (times) => {if (times > 1) {return 's'} else {return ''}}

					if (checkedCount != times) {
						inError.push('error')
						$(id).find('.js-day-label-errors').text(`You must select ${times} day${pluralize(times)}.`);
					}
				});
				if (inError.length) {
					return false;
				}
				return true;
			}
			return true;
		}

		if (dayLabelCheck()) {
			$('.js-updating').show();
			$('.js-submit').prop('disabled', true);

			// Get Resources Ids from local collection
			let resourceIds = [];
			LocalResources.find().forEach(function(resource) {
				resourceIds.push(resource.id);
			});

			// Get Scheduled Days
			let checkedCount = $('.js-day-labels').find('input:checked').length;

			let updateScheduleDays = [];
			$('.js-day-labels-section').each(function() {
				let segmentCount = parseInt($(this).attr('data-segment-count'))
				if (segmentCount) {
					let days = []
					if (checkedCount) {
						$(this).find("[name='scheduledDays']:checked").each(function() {
							days.push(parseInt($(this).val()))
						});
					} 
					updateScheduleDays.push({'segmentCount': segmentCount, 'days': days})
				}
			});

			let scheduledDays = template.scheduledDays.get();
			scheduledDays.forEach(existingSchedule => {
				let updateSchedule = updateScheduleDays.find(updateSchedule => updateSchedule.segmentCount === existingSchedule.segmentCount);
				if (JSON.stringify(existingSchedule.days) != JSON.stringify(updateSchedule.days)) {
					existingSchedule.new = true;
				} else if (existingSchedule.new != true) {
					existingSchedule.new = false;
				}
			});

			let subjectId = event.target.subjectId.value.trim();
			let hasNewSubject = (subjectId) => {
				let schoolWork = SchoolWork.findOne({_id: FlowRouter.getParam('selectedSchoolWorkId')});
				if (schoolWork.subjectId && subjectId === schoolWork.subjectId) {
					return false;
				} 
				if (schoolWork.subjectId == null && subjectId === 'noSubject') {
					return false;
				}
				return true;
			}

			// Get School Work Properties
			let updateSchoolWorkProperties = {
				_id: FlowRouter.getParam('selectedSchoolWorkId'),
				name: template.find("[name='name']").value.trim(),
				description: $('.js-form-school-work-update .editor-content').html(),
				resources: resourceIds,
				studentId: FlowRouter.getParam('selectedStudentId'),
				subjectId: subjectId === 'noSubject' ? '' : subjectId,
				schoolYearId: FlowRouter.getParam('selectedSchoolYearId'),
				scheduledDays: updateScheduleDays,
			}

			let upsertLessonProperties = [];
			let removeLessonIds = [];
			let weekIds = [];
			let error = [];

			// Get Lesson Properties from form
			$("[name='timesPerWeek']").each(function(index) {
				let totalLessons =  parseInt(this.dataset.lessonCount);
				let completeLessons = parseInt(this.dataset.lessonCompleteCount);
				let newLessonsTotal = parseInt(this.value) || 0;

				if (newLessonsTotal > totalLessons) {
					scheduledDays[0].new = true;
					let addCount =  newLessonsTotal - totalLessons;
					for (i = 0; i < addCount; i++) { 
					    upsertLessonProperties.push({
							order: i + 1 + parseInt(totalLessons),
					    	weekOrder: parseInt(this.dataset.weekOrder),
					    	termOrder: parseInt(this.dataset.termOrder), 
					    	termId: this.dataset.termId,
							assigned: false,
							completed: false,
					    	schoolWorkId: FlowRouter.getParam('selectedSchoolWorkId'),
					    	schoolYearId: FlowRouter.getParam('selectedSchoolYearId'),
					    	weekId: this.dataset.weekId,
					    	studentId: FlowRouter.getParam('selectedStudentId'),
							createdOn: new Date()
					    });
					    weekIds.push(this.dataset.weekId);
					}
				}

				if (newLessonsTotal < totalLessons && newLessonsTotal >= completeLessons) {
					scheduledDays[0].new = true;
					let removalCount = totalLessons - newLessonsTotal;
					let removeableLessonsIds = Lessons.find({weekId: this.dataset.weekId, completed: false, schoolWorkId: FlowRouter.getParam('selectedSchoolWorkId')}, {sort: {order: -1}, limit: removalCount}).map(lesson => (lesson._id));

					removeableLessonsIds.forEach(lessonId => {
						removeLessonIds.push(lessonId);
					});
				}

				if (newLessonsTotal < completeLessons) {
					error.push({type: 'delete'})
				}
			});

			if (error.length) {
				Alerts.insert({
					colorClass: 'bg-danger',
					iconClass: 'icn-danger',
					message: 'These changes would delete lessons you have already worked on.',
				});

				$('.js-updating').hide();
				$('.js-submit').prop('disabled', false);

				return false;
			} else {
				// Add weekDay to Lesson properties
				let existingLessons = Lessons.find({_id: {$nin: removeLessonIds}, schoolWorkId: FlowRouter.getParam('selectedSchoolWorkId')}, {fields: {_id: 1, order: 1, weekId: 1, schoolWorkId: 1}}).fetch();
				let existingLessonIds = existingLessons.map(lesson => lesson._id);
				let updateLessonIds = upsertLessonProperties.map(lesson => lesson._id);
				let hasNewScheduledDays = scheduledDays.map(schedule => schedule.new).indexOf(true) >= 0;

				if (hasNewScheduledDays) {
					upsertLessonProperties = existingLessons.concat(upsertLessonProperties);

					Terms.find({schoolYearId: FlowRouter.getParam('selectedSchoolYearId')}).forEach(term => {
						Weeks.find({termId: term._id}).forEach(week => {
							let weeksLessons = _.filter(upsertLessonProperties, { 'weekId': week._id });
							let segmentCount = weeksLessons.length;

							if (segmentCount) {
								let weekDayLabels = updateScheduleDays.find(dayLabel => parseInt(dayLabel.segmentCount) === segmentCount).days || 0;

								weeksLessons.forEach((lesson, i) => {
									let weekDay = (weekDayLabels) => {
										if (weekDayLabels.length) {
											return parseInt(weekDayLabels[i]);
										}
										return 0;
									}
									lesson.weekDay = parseInt(weekDayLabels[i]);
								});
							}

						});
					});
				};

				let insertLessonProperties = _.filter(upsertLessonProperties, lesson => _.includes(updateLessonIds, lesson._id));
				let updateLessonProperties = _.filter(upsertLessonProperties, lesson => _.includes(existingLessonIds, lesson._id));

				let pathProperties = {
					studentIds: [FlowRouter.getParam('selectedStudentId')],
					schoolYearIds: [FlowRouter.getParam('selectedSchoolYearId')],
					termIds: Array.from(document.getElementsByClassName('js-times-per-week-container')).map(term => term.id),
				}

				let statProperties = {
					studentIds: [FlowRouter.getParam('selectedStudentId')],
					schoolYearIds: [FlowRouter.getParam('selectedSchoolYearId')],
					termIds: Array.from(document.getElementsByClassName('js-term-container')).map(term => term.id),
					weekIds: weekIds,
				}

				Meteor.call('updateSchoolWork', updateSchoolWorkProperties, removeLessonIds, insertLessonProperties, updateLessonProperties, hasNewSubject(subjectId), function(error, result) {
					if (error) {
						Alerts.insert({
							colorClass: 'bg-danger',
							iconClass: 'icn-danger',
							message: error.message,
						});
						
						$('.js-updating').hide();
						$('.js-submit').prop('disabled', false);
					} else {
						Meteor.call('runUpsertSchoolWorkPathsAndStats', pathProperties, statProperties, function(error, result) {
							if (error) {
								Alerts.insert({
									colorClass: 'bg-danger',
									iconClass: 'icn-danger',
									message: error.message,
								});
								
								$('.js-updating').hide();
								$('.js-submit').prop('disabled', false);
							} else {
								$('.js-updating').hide();
								$('.js-submit').prop('disabled', false);
								FlowRouter.go('/planning/work/view/3/' + FlowRouter.getParam('selectedStudentId') +'/'+ FlowRouter.getParam('selectedSchoolYearId') +'/'+ FlowRouter.getParam('selectedSchoolWorkId'));
							}
						});
					}
				});

				return false;
			}
		}
	},

	'click .js-cancel'(event) {
		event.preventDefault();

		if (window.screen.availWidth > 768) {
			FlowRouter.go('/planning/work/view/3/' + FlowRouter.getParam('selectedStudentId') +'/'+ FlowRouter.getParam('selectedSchoolYearId') +'/'+ FlowRouter.getParam('selectedSchoolWorkId'));
		} else {
			FlowRouter.go('/planning/work/view/2/' + FlowRouter.getParam('selectedStudentId') +'/'+ FlowRouter.getParam('selectedSchoolYearId') +'/'+ FlowRouter.getParam('selectedSchoolWorkId'));
		}
	},
});


let setScheduledDays = template => {
	let timesPerWeek = [];

	$("[name='timesPerWeek']").each(function(index) {
		if (this.value && isNaN(parseInt(this.value))) {
			$(this).addClass('error');
			$(this).parent().find('.js-times-per-week-errors').text('Number');
		} else {
			$(this).removeClass('error');
			if (this.value && parseInt(this.value) > 7) {
				$(this).addClass('error');
				$(this).parent().find('.js-times-per-week-errors').text('Limit 7');
			} else {
				$(this).removeClass('error');
				$(this).parent().find('.js-times-per-week-errors').text('');
			}
		}

		if (Number.isInteger(parseInt(this.value)) && parseInt(this.value) <= 7) {
			timesPerWeek.push(parseInt(this.value));
		}
	});

	timesPerWeek = (_.uniq(timesPerWeek).sort());
	let newScheduledDays = [];

	timesPerWeek.forEach(time => {
		let existingScheduledDays = template.existingScheduledDays.get();
		let scheduledDays = template.scheduledDays.get();

		if (existingScheduledDays.filter(scheduled => scheduled.segmentCount === time).length) {
			let newSchedule = existingScheduledDays.find(scheduled => scheduled.segmentCount === time);
			if (newSchedule.segmentCount && newSchedule.segmentCount != 0 && newSchedule.segmentCount != '0') {
				newSchedule.new = false; 
				newScheduledDays.push(newSchedule)
			}
		} else {
			if (time && time != 0 && time != '0') {
				newScheduledDays.push({
					segmentCount: time, 
					days: [], 
					new: true,
				});
			}
		}
	});

	template.timesPerWeek.set(_.uniq(timesPerWeek).sort());
	template.scheduledDays.set(newScheduledDays);
}






