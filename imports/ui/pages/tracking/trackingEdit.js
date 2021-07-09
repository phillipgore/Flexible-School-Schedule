import {Template} from 'meteor/templating';
import { Students } from '../../../api/students/students.js';
import { SchoolYears } from '../../../api/schoolYears/schoolYears.js';
import { Subjects } from '../../../api/subjects/subjects.js';
import { SchoolWork } from '../../../api/schoolWork/schoolWork.js';
import { Terms } from '../../../api/terms/terms.js';
import { Weeks } from '../../../api/weeks/weeks.js';
import { Lessons } from '../../../api/lessons/lessons.js';
import { Notes } from '../../../api/notes/notes.js';

import './trackingEdit.html';
import _ from 'lodash';


Template.trackingEdit.onCreated( function() {
	let template = Template.instance();
	
	template.autorun(() => {
		// Subscriptions
		this.trackingEditData = Meteor.subscribe('trackingEditPub', FlowRouter.getParam('selectedStudentId'), FlowRouter.getParam('selectedSchoolYearId'), FlowRouter.getParam('selectedWeekId'));
	});
});

Template.trackingEdit.onRendered( function() {
	Session.set({
		selectedReportingTermId: FlowRouter.getParam('selectedTermId'),
		selectedReportingWeekId: FlowRouter.getParam('selectedWeekId'),
		toolbarType: 'edit',
		newUrl: '',
		activeNav: 'trackingList',
		existingTerm: FlowRouter.getParam('selectedTermId'),
		action: 'choose',
	});
});

Template.trackingEdit.helpers({
	subscriptionReady: function() {
		return Template.instance().trackingEditData.ready();
	},

	student: function() {
		return Students.findOne({_id: FlowRouter.getParam('selectedStudentId')});
	},

	selectedSchoolYear: function() {
		return SchoolYears.findOne({_id: FlowRouter.getParam('selectedSchoolYearId')});
	},

	terms: function() {
		return Terms.find({schoolYearId: FlowRouter.getParam('selectedSchoolYearId')})
	},

	selectedTerm: function() {
		return Terms.findOne({_id: FlowRouter.getParam('selectedTermId')});
	},

	selectedTermId: function() {
		return FlowRouter.getParam('selectedTermId');
	},

	weeks: function() {
		return Weeks.find({}, {sort: {order: 1}});
	},

	selectedWeek: function() {
		return Weeks.findOne({_id: FlowRouter.getParam('selectedWeekId')});
	},

	selectedWeekId: function() {
		return FlowRouter.getParam('selectedWeekId');
	},

	weekLessonsExist: function() {
		if (Lessons.find({weekId: FlowRouter.getParam('selectedWeekId')}).count()) {
			return true;
		}
		return false;
	},

	schoolWork: function() {
		if (Template.instance().trackingEditData.ready()) {
			return getMiddleSchoolWork(FlowRouter.getParam('selectedStudentId'), FlowRouter.getParam('selectedSchoolYearId'));
		}
	},

	studentName(first, last) {
		if (first && last) {
			Session.set({labelTwo: first + ' ' + last});
		}
		return false;
	},

	activeSelectItem: function(currentItem, item) {
		if (currentItem === item) {
			return true;
		}
		return false;
	},

	existingTerm: function() {
		return Session.get('existingTerm');
	},

	existingWeeks: function(termId) {
		return Weeks.find({termId: termId})
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
		if (action === 'insert') {
			return true;
		}
		return false;
	},

	daysOfWeek: function() {
		return [1, 2, 3, 4, 5, 6, 7]
	},

	hasWeekDay: function(weekDay) {
		let lessons = Lessons.find({weekId: FlowRouter.getParam('selectedWeekId'), studentId: FlowRouter.getParam('selectedStudentId')})
		let weekDays = _.uniq(lessons.map(lesson => parseInt(lesson.weekDay)));

		if (weekDays.indexOf(parseInt(weekDay)) >= 0) {
			return true
		}
		return false;
	},

	hasComplete: function() {
		let completedLessonCount = Lessons.find({completed: true, weekId: FlowRouter.getParam('selectedWeekId'), studentId: FlowRouter.getParam('selectedStudentId')}).count()

		if (completedLessonCount) {
			return true
		}
		return false;
	},

	hasDoNext: function() {
		let doNextLessonCount = Lessons.find({assigned: true, completed: false, weekId: FlowRouter.getParam('selectedWeekId'), studentId: FlowRouter.getParam('selectedStudentId')}).count()

		if (doNextLessonCount) {
			return true
		}
		return false;
	},

	hasOpen: function() {
		let openLessonCount = Lessons.find({assigned: false, completed: false, weekId: FlowRouter.getParam('selectedWeekId'), studentId: FlowRouter.getParam('selectedStudentId')}).count()

		if (openLessonCount) {
			return true
		}
		return false;
	},
});

Template.trackingEdit.events({
	'change .js-checkbox-existing-append-notes, change .js-checkbox-new-append-notes'(event) {
		if ($(event.currentTarget).val() === 'true') {
			$(event.currentTarget).val('false');
		} else {
			$(event.currentTarget).val('true');
		}
	},

	'change .js-check-multiple'(event) {
		event.preventDefault();
		let id = event.currentTarget.id;

		if ($(event.currentTarget).val() === 'true') {
			$(event.currentTarget).val('false').prop('checked', false);
			if (id === 'all') {
				$('.js-segment-checkbox').each(function() {
					$(this).val('false').prop('checked', false);
				});
			} else {
				$('.js-week-' + id + ', .js-status-' + id).each(function() {
					$(this).val('false').prop('checked', false);
				});
			}
		} else {
			$(event.currentTarget).val('true').prop('checked', true);
			if (id === 'all') {
				$('.js-segment-checkbox').each(function() {
					$(this).val('true').prop('checked', true);
				});
			} else {
				$('.js-week-' + id + ', .js-status-' + id).each(function() {
					$(this).val('true').prop('checked', true);
				});
			}
		}
	},

	'change .js-segment-checkbox, change .js-check-multiple'(event) {
		event.preventDefault();
		
		// All
		if ($('.js-segment-checkbox').length === $('.js-segment-checkbox:checked').length) {
			$('.js-check-multiple-all').val('true').prop('checked', true);
		} else {
			$('.js-check-multiple-all').val('false').prop('checked', false);
		}

		// Completed
		if ($('.js-status-completed').length === $('.js-status-completed:checked').length) {
			$('.js-check-multiple-completed').val('true').prop('checked', true);
		} else {
			$('.js-check-multiple-completed').val('false').prop('checked', false);
		}

		// Do Next
		if ($('.js-status-next').length === $('.js-status-next:checked').length) {
			$('.js-check-multiple-next').val('true').prop('checked', true);
		} else {
			$('.js-check-multiple-next').val('false').prop('checked', false);
		}

		// Open
		if ($('.js-status-open').length === $('.js-status-open:checked').length) {
			$('.js-check-multiple-open').val('true').prop('checked', true);
		} else {
			$('.js-check-multiple-open').val('false').prop('checked', false);
		}

		// Weekdays
		if ($('.js-week-1').length === $('.js-week-1:checked').length) {
			$('.js-check-multiple-1').val('true').prop('checked', true);
		} else {
			$('.js-check-multiple-1').val('false').prop('checked', false);
		}
		if ($('.js-week-2').length === $('.js-week-2:checked').length) {
			$('.js-check-multiple-2').val('true').prop('checked', true);
		} else {
			$('.js-check-multiple-2').val('false').prop('checked', false);
		}
		if ($('.js-week-3').length === $('.js-week-3:checked').length) {
			$('.js-check-multiple-3').val('true').prop('checked', true);
		} else {
			$('.js-check-multiple-3').val('false').prop('checked', false);
		}
		if ($('.js-week-4').length === $('.js-week-4:checked').length) {
			$('.js-check-multiple-4').val('true').prop('checked', true);
		} else {
			$('.js-check-multiple-4').val('false').prop('checked', false);
		}
		if ($('.js-week-5').length === $('.js-week-5:checked').length) {
			$('.js-check-multiple-5').val('true').prop('checked', true);
		} else {
			$('.js-check-multiple-5').val('false').prop('checked', false);
		}
		if ($('.js-week-6').length === $('.js-week-6:checked').length) {
			$('.js-check-multiple-6').val('true').prop('checked', true);
		} else {
			$('.js-check-multiple-6').val('false').prop('checked', false);
		}
		if ($('.js-week-7').length === $('.js-week-7:checked').length) {
			$('.js-check-multiple-7').val('true').prop('checked', true);
		} else {
			$('.js-check-multiple-7').val('false').prop('checked', false);
		}
	},

	'change .js-action'(event) {
		let action = event.currentTarget.value;

		Session.set('action', action);
		$('.js-action-data').hide();
		$('.js-' + action).fadeIn(300);
	},

	'change .js-existing-term'(event) {
		let termId= event.currentTarget.value;
		Session.set('existingTerm', termId);
	},

	'click .js-cancel'(event) {
		event.preventDefault();
		FlowRouter.go('/tracking/students/view/2/' + FlowRouter.getParam('selectedStudentId') +'/'+ FlowRouter.getParam('selectedSchoolYearId') +'/'+ FlowRouter.getParam('selectedTermId') +'/'+ FlowRouter.getParam('selectedWeekId'))
	},

	'submit .js-tracking-update'(event) {
		event.preventDefault();

		// Set Stat Properties
		let statProperties = {
			studentIds: [FlowRouter.getParam('selectedStudentId')],
			schoolYearIds: [FlowRouter.getParam('selectedSchoolYearId')],
			termIds:[FlowRouter.getParam('selectedTermId')],
			weekIds:[FlowRouter.getParam('selectedWeekId')],
		}

		// Set Path Properties
		let pathProperties = {
			studentIds: [FlowRouter.getParam('selectedStudentId')],
			schoolYearIds: [FlowRouter.getParam('selectedSchoolYearId')],
			termIds: [FlowRouter.getParam('selectedTermId')],
		}

		// Get Checked Lessons
		let batchCheckedLessonProperties = [];

		$('.js-segment-checkbox').each(function() {
			if ($(this).val().trim() === 'true') {
				let weekDay = parseInt($(this).attr('data-weekDay')) || 0;
				batchCheckedLessonProperties.push({ 
					_id: $(this).attr('data-lesson-id'),
					schoolWorkId: $(this).attr('data-schoolWork-id'),
					completed: $(this).attr('data-completed') === 'true',
					weekDay: parseInt(weekDay),
					hadWeekDay: $(this).attr('data-hadWeekDay') === 'true',
				})
			}
		});

		// Get Unchecked Lessons from School Work with Checked Lesson
		let schoolWorkIds = _.uniq(batchCheckedLessonProperties.map(lesson => lesson.schoolWorkId));
		let batchUncheckedLessonProperties = [];

		schoolWorkIds.forEach(workId => {
			$('#js-work-track-' + workId).find('.js-segment-checkbox').each(function() {
				if ($(this).val().trim() != 'true') {
					let weekDay = parseInt($(this).attr('data-weekDay')) || 0;
					batchUncheckedLessonProperties.push({ 
						_id: $(this).attr('data-lesson-id'),
						schoolWorkId: $(this).attr('data-schoolWork-id'),
						completed: $(this).attr('data-completed') === 'true',
						weekDay: parseInt(weekDay),
						hadWeekDay: $(this).attr('data-hadWeekDay') === 'true',
					})
				}
			})
		});

		let action = $('.js-action').val();

		// No Choice ----------------------------------------------------------------------
		if (action === 'choose') {

			Alerts.insert({
				colorClass: 'bg-info',
				iconClass: 'icn-info',
				message: 'You must select an action or click "Cancel".',
			});
			
			return false;
		}

		// Labels ----------------------------------------------------------------------
		if (action === 'labels') {
			
			$('.js-updating').show();
			$('.js-submit').prop('disabled', true);

			let bulkLabelUpdateLessons = []
			event.target.weekDayLabel.forEach(label => {
				bulkLabelUpdateLessons.push({updateOne: 
					{ 
						filter: {_id: label.id}, 
						update: {$set: {
							weekDay: parseInt(label.value),
							weekDayEdited: true,
						}} 
					} 
				});
			});

			Meteor.call('bulkLabelUpdateLessons', bulkLabelUpdateLessons, function(error, result) {
				if (error) {
					Alerts.insert({
						colorClass: 'bg-danger',
						iconClass: 'icn-danger',
						message: error.reason,
					});
					$('.js-updating').hide();
					$('.js-submit').prop('disabled', false);
				} else {
					FlowRouter.go('/tracking/students/view/2/' + FlowRouter.getParam('selectedStudentId') +'/'+ FlowRouter.getParam('selectedSchoolYearId') +'/'+ FlowRouter.getParam('selectedTermId') +'/'+ FlowRouter.getParam('selectedWeekId'));
				}
			});
				
			return false;
		}


		if (batchCheckedLessonProperties.length) {

			// Insert ----------------------------------------------------------------------
			if (action === 'insert') {

				$('.js-updating').show();
				$('.js-submit').prop('disabled', true);

				let week = Weeks.findOne({_id: FlowRouter.getParam('selectedWeekId')});
				let term = Terms.findOne({_id: FlowRouter.getParam('selectedTermId')});

				let schoolWorkIds = batchCheckedLessonProperties.map(lesson => lesson.schoolWorkId);
				let uncheckedLessons = Lessons.find({schoolWorkId: {$in: schoolWorkIds}}).fetch();

				schoolWorkIds.forEach(schoolWorkId => {
					let days = [1, 2, 3, 4, 5, 6, 7];
					let newDays = uncheckedLessons.filter(lesson => lesson.schoolWorkId === schoolWorkId).map(schoolWorkLesson => schoolWorkLesson.weekDay);
					let newDifferenceDays = _.difference(days, newDays);
					let baseOrder = 1

					// New Lessons
					batchCheckedLessonProperties.filter(lesson => lesson.schoolWorkId === schoolWorkId).forEach((lesson, index) => {
						let schoolWorkHasWeekDays = Lessons.find({
							schoolWorkId: lesson.schoolWorkId, 
							weekDay: {$gte: 1, $exists: true}
						}).count();

						lesson.weekDay = 0;
						delete lesson.hadWeekDay

						if (schoolWorkHasWeekDays) {
							lesson.order = newDifferenceDays[index];
						} else {
							lesson.order = newDays.length + baseOrder;
							baseOrder++
						}
					});

					let existingDifferenceDays = _.difference(days, newDifferenceDays);
					uncheckedLessons.filter(lesson => lesson.schoolWorkId === schoolWorkId).forEach((lesson, index) => {
						let schoolWorkHasWeekDays = Lessons.find({
							schoolWorkId: lesson.schoolWorkId,
							weekDay: {$gte: 1, $exists: true}
						}).count();
						if (schoolWorkHasWeekDays) {
							lesson.order = existingDifferenceDays[index];
						} else {
							lesson.weekDay = 0;
						}
					});
				});

				let bulkInsertLessonProperties = [];

				batchCheckedLessonProperties.forEach(lesson => {
					bulkInsertLessonProperties.push({insertOne: {"document": {
						_id: lesson._id,
						order: parseInt(lesson.order),
						weekDay: parseInt(lesson.weekDay),
						weekOrder: parseInt(week.order),
						termOrder: parseInt(term.order),
						assigned: false,
						completed: false,
						schoolWorkId: lesson.schoolWorkId,
						schoolYearId: FlowRouter.getParam('selectedSchoolYearId'),
						termId: FlowRouter.getParam('selectedTermId'),
						weekId: FlowRouter.getParam('selectedWeekId'),
						studentId: FlowRouter.getParam('selectedStudentId'),
						groupId: Meteor.user().info.groupId, 
						userId: Meteor.user()._id, 
						createdOn: new Date(),
					}}});
				});

				let bulkUpdateLessonProperties = [];

				uncheckedLessons.forEach(lesson => {
					bulkUpdateLessonProperties.push({updateOne: 
						{ 
							filter: {_id: lesson._id}, 
							update: {$set: {
								order: parseInt(lesson.order),
							}} 
						} 
					});
				});

				Meteor.call('bulkInsertLessons', bulkInsertLessonProperties, bulkUpdateLessonProperties, function(error, result) {
					if (error) {
						Alerts.insert({
							colorClass: 'bg-danger',
							iconClass: 'icn-danger',
							message: error.reason,
						});
						$('.js-updating').hide();
						$('.js-submit').prop('disabled', false);
					} else {
						FlowRouter.go('/tracking/students/view/2/' + FlowRouter.getParam('selectedStudentId') +'/'+ FlowRouter.getParam('selectedSchoolYearId') +'/'+ FlowRouter.getParam('selectedTermId') +'/'+ FlowRouter.getParam('selectedWeekId'));
					}
				});

				return false;
			}

			batchCheckedLessonProperties.forEach(lesson => {
				delete lesson.hadWeekDay;
			});
			batchUncheckedLessonProperties.forEach(lesson => {
				delete lesson.hadWeekDay;
			});

			// Complete ----------------------------------------------------------------------
			if (action === 'complete') {

				$('.js-updating').show();
				$('.js-submit').prop('disabled', true);

				batchCheckedLessonProperties.forEach(lesson => {
					lesson.completed = true;
				})
			}


			// Incomplete ----------------------------------------------------------------------
			if (action === 'incomplete') {

				$('.js-updating').show();
				$('.js-submit').prop('disabled', true);

				batchCheckedLessonProperties.forEach(lesson => {
					lesson.completed = false;
				})
			}


			// Assigned ----------------------------------------------------------------------
			if (action === 'assigned') {

				$('.js-updating').show();
				$('.js-submit').prop('disabled', true);
				
				batchCheckedLessonProperties.forEach(lesson => {
					lesson.assigned = true;
				})
			}


			// Unassigned ----------------------------------------------------------------------
			if (action === 'unassigned') {

				$('.js-updating').show();
				$('.js-submit').prop('disabled', true);
				
				batchCheckedLessonProperties.forEach(lesson => {
					lesson.assigned = false;
				})
			}


			// Existing Week ----------------------------------------------------------------------
			if (action === 'existing') {

				$('.js-updating').show();
				$('.js-submit').prop('disabled', true);

				let weekId = $('.js-existing-week').val();
				let week = Weeks.findOne({_id: weekId});
				let term = Terms.findOne({_id: week.termId});
				
				let lessonStats = []
				schoolWorkIds.forEach(schoolWorkId => {
					let lessonCount = _.filter(batchCheckedLessonProperties, ['schoolWorkId', schoolWorkId]).length;
					lessonStats.push({schoolWorkId: schoolWorkId, lessonCount: lessonCount});
				})

				function getNoteProperties() {
					if ($('.js-checkbox-existing-append-notes').val().trim() === 'true') {
						let notes = Notes.find({schoolWorkId: {$in: schoolWorkIds}, weekId: FlowRouter.getParam('selectedWeekId')}).fetch()
						notes.forEach(note => {
							note.weekId = weekId;
						})
						return notes;	
					}
					return [];
				}

				function notePlacement() {
					let currentWeekOrder = Weeks.findOne({_id: FlowRouter.getParam('selectedWeekId')}).order
					let newWeekOrder = Weeks.findOne({_id: weekId}).order
					if (newWeekOrder > currentWeekOrder) {
						return 'append';
					}
					return 'prepend';
				}

				Meteor.call('checkSpecificWeek', weekId, lessonStats, function(error, newLessonStats) {
					if (error) {
						Alerts.insert({
							colorClass: 'bg-danger',
							iconClass: 'icn-danger',
							message: error.reason,
						});
					} else {
						let error = [];
						newLessonStats.forEach(lessonStat => {
							if (lessonStat.lessonCount >= 8) {
								error.push('error');

								$('#js-work-track-' + lessonStat.schoolWorkId).find('.track-icon i').addClass('txt-danger-dark');
								$('#js-work-track-' + lessonStat.schoolWorkId).find('.track-label').addClass('txt-danger-dark');
								$('#js-work-track-' + lessonStat.schoolWorkId).find('.error').text(`School Work can only have 7 segments per week. This change would make ${lessonStat.lessonCount} segments for this item of School Work in the newly selected week.`);
							}
						})

						if (error.length) {
							error = [];
							$('.js-updating').hide();
							$('.js-submit').prop('disabled', false);
							return false;
						} else {
							statProperties.termIds.push(term._id);
							statProperties.weekIds.push(weekId);
							pathProperties.termIds.push(term._id);

							batchCheckedLessonProperties.forEach((lesson, index) => {
								lesson.order = _.find(newLessonStats, ['schoolWorkId', lesson.schoolWorkId]).newWeekLessonCount + index + 1;
								lesson.weekOrder = week.order;
								lesson.termOrder = term.order;
								lesson.termId = term._id;
								lesson.weekId = weekId;
							});

							schoolWorkIds.forEach(workId => {
								let lessons = _.filter(batchUncheckedLessonProperties, {'schoolWorkId': workId});
								lessons.forEach((lesson, index) => {
									lesson.order = index + 1
								});
							});

							Meteor.call('batchMoveLessonsToExistingWeek', batchCheckedLessonProperties, batchUncheckedLessonProperties, getNoteProperties(), notePlacement(), function(error, result) {
								if (error) {
									Alerts.insert({
										colorClass: 'bg-danger',
										iconClass: 'icn-danger',
										message: error.reason,
									});
									$('.js-updating').hide();
									$('.js-submit').prop('disabled', false);
								} else {
									Meteor.call('runUpsertSchoolWorkPathsAndStats', pathProperties, statProperties, function() {
										if (error) {
											Alerts.insert({
												colorClass: 'bg-danger',
												iconClass: 'icn-danger',
												message: error.reason,
											});
											$('.js-updating').hide();
											$('.js-submit').prop('disabled', false);
										} else {
											FlowRouter.go('/tracking/students/view/2/' + FlowRouter.getParam('selectedStudentId') +'/'+ FlowRouter.getParam('selectedSchoolYearId') +'/'+ FlowRouter.getParam('selectedTermId') +'/'+ FlowRouter.getParam('selectedWeekId'))
										}
									})
								}
							});
						}
					}
				})

				return false;
			}


			// New Week ----------------------------------------------------------------------
			if (action === 'new') {

				$('.js-updating').show();
				$('.js-submit').prop('disabled', true);
				
				let termId = $('.js-move-term').val();
				let term = Terms.findOne({_id: termId});
				let lastWeek = Weeks.findOne({termId: termId}, {sort: {order: -1}});

				let weekProperties = {
					order: parseInt(lastWeek.order + 1),
					termOrder: term.order,
					schoolYearId: FlowRouter.getParam('selectedSchoolYearId'),
					termId: termId
				}

				Meteor.call('insertWeeks', weekProperties, function(error, weekId) {
					if (error) {
						Alerts.insert({
							colorClass: 'bg-danger',
							iconClass: 'icn-danger',
							message: error.reason,
						});
					} else {
						statProperties.weekIds.push(weekId);

						schoolWorkIds.forEach(workId => {
							let lessons = _.orderBy(_.filter(batchCheckedLessonProperties, {'schoolWorkId': workId}), ['completed', 'order', 'weekDay'], ['desc', 'asc']);
							lessons.forEach((lesson, index) => {
								lesson.order = index + 1;
								lesson.weekOrder = lastWeek.order + 1;
								lesson.termOrder = term.order;
								lesson.termId = termId;
								lesson.weekId = weekId;
							});
						});

						schoolWorkIds.forEach(workId => {
							let lessons = _.filter(batchUncheckedLessonProperties, {'schoolWorkId': workId});
							lessons.forEach((lesson, index) => {
								lesson.order = index + 1
							});
						});

						let lessonProperties = batchCheckedLessonProperties.concat(batchUncheckedLessonProperties);

						function getNoteProperties() {
							if ($('.js-checkbox-new-append-notes').val().trim() === 'true') {
								let notes = Notes.find({schoolWorkId: {$in: schoolWorkIds}, weekId: FlowRouter.getParam('selectedWeekId')}).fetch()
								notes.forEach(note => {
									note.weekId = weekId;
									delete note._id;
								})
								return notes;	
							}
							return [];
						}

						Meteor.call('batchUpdateLessons', lessonProperties, getNoteProperties(), function(error, result) {
							if (error) {
								Alerts.insert({
									colorClass: 'bg-danger',
									iconClass: 'icn-danger',
									message: error.reason,
								});
								$('.js-updating').hide();
								$('.js-submit').prop('disabled', false);
							} else {
								Meteor.call('runUpsertSchoolWorkPathsAndStats', pathProperties, statProperties, function() {
									if (error) {
										Alerts.insert({
											colorClass: 'bg-danger',
											iconClass: 'icn-danger',
											message: error.reason,
										});
										$('.js-updating').hide();
										$('.js-submit').prop('disabled', false);
									} else {
										FlowRouter.go('/tracking/students/view/2/' + FlowRouter.getParam('selectedStudentId') +'/'+ FlowRouter.getParam('selectedSchoolYearId') +'/'+ FlowRouter.getParam('selectedTermId') +'/'+ FlowRouter.getParam('selectedWeekId'))
									}
								})
							}
						});
					}
				});

				return false;
			}


			// Delete ----------------------------------------------------------------------
			if (action === 'delete') {
				function pluralizeSegment() {
					if (batchCheckedLessonProperties.length > 1) {
						return 'these segments'
					}
					return 'this segment'
				}

				Dialogs.insert({
					heading: 'Confirmation',
					message: 'Are you sure you want to delete ' + pluralizeSegment() + '?',
					confirmClass: 'js-delete js-delete-segment-confirmed',
				});

				return false;
			}


		} else {
			// No Segments Selected ----------------------------------------------------------------------
			Alerts.insert({
				colorClass: 'bg-info',
				iconClass: 'icn-info',
				message: 'You must check at least one segment or click "Cancel".',
			});

			return false;
		}

		// Batch Update Lessons
		Meteor.call('batchUpdateLessons', batchCheckedLessonProperties, [], function(error, result) {
			if (error) {
				Alerts.insert({
					colorClass: 'bg-danger',
					iconClass: 'icn-danger',
					message: error.reason,
				});
				$('.js-updating').hide();
				$('.js-submit').prop('disabled', false);
			} else {
				Meteor.call('runUpsertSchoolWorkPathsAndStats', pathProperties, statProperties, function() {
					if (error) {
						Alerts.insert({
							colorClass: 'bg-danger',
							iconClass: 'icn-danger',
							message: error.reason,
						});
						$('.js-updating').hide();
						$('.js-submit').prop('disabled', false);
					} else {
						FlowRouter.go('/tracking/students/view/2/' + FlowRouter.getParam('selectedStudentId') +'/'+ FlowRouter.getParam('selectedSchoolYearId') +'/'+ FlowRouter.getParam('selectedTermId') +'/'+ FlowRouter.getParam('selectedWeekId'))
					}
				})
			}
		});
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














