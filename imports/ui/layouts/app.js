import {Template} from 'meteor/templating';
import { Paths } from '../../api/paths/paths.js';
import { Groups } from '../../api/groups/groups.js';
import { SchoolYears } from '../../api/schoolYears/schoolYears.js';
import { Students } from '../../api/students/students.js';
import { Resources } from '../../api/resources/resources.js';
import { Subjects } from '../../api/subjects/subjects.js';
import { SchoolWork } from '../../api/schoolWork/schoolWork.js';
import { Reports } from '../../api/reports/reports.js';
import { Terms } from '../../api/terms/terms.js';
import { Weeks } from '../../api/weeks/weeks.js';
import { Notes } from '../../api/notes/notes.js';
import './app.html';
import moment from 'moment';
import _ from 'lodash'

Alerts = new Mongo.Collection(null);
Dialogs = new Mongo.Collection(null);

Template.app.onRendered( function() {
	$('.loading-initializing').fadeOut('fast', function() {
		$(this).remove();
	});
});

Template.app.helpers({
	selectedSchoolWorkId: function() {
		return Session.get('selectedSchoolWorkId');
	},
	selectedSchoolWorkType: function() {
		return Session.get('selectedSchoolWorkType');
	},
	suserId: function() {
		return Meteor.userId();
	},

	windowHeight: function() {
		return Session.get('windowHeight');
	},

	windowWidth: function() {
		return Session.get('windowWidth');
	},

	alerts: function() {
		return Alerts.find();
	},

	dialog: function() {
		return Dialogs.findOne();
	},

	selectedFrameClass: function() {
		return Session.get('selectedFrameClass')
	},

	showSubbar: function() {
		if (Session.get('windowHeight') >= 640 || Session.get('selectedFramePosition') === 2 || Session.get('selectedFramePosition') === 3 || FlowRouter.current().route.name === 'trackingView' || FlowRouter.current().route.name === 'createAccount' || FlowRouter.current().route.name === 'verifySent' || FlowRouter.current().route.name === 'verifySuccess' || FlowRouter.current().route.name === 'signIn' || FlowRouter.current().route.name === 'reset' || FlowRouter.current().route.name === 'resetSent' || FlowRouter.current().route.name === 'resetPassword' || FlowRouter.current().route.name === 'resetSuccess') {
			return true;
		}
		return false;
	},

	resourcePopUp: function() {
		if (FlowRouter.getRouteName() === 'workNew' || FlowRouter.getRouteName() === 'workEdit') {
			return true;
		}
		return false;
	}
});

Template.app.events({
	// Universal Click Event
	'click'(event) {
		if (!$(event.currentTarget).hasClass('js-dropdown') && !$(event.target).hasClass('js-click-exempt')) {
			$('.dropdown-menu, .list-item-dropdown-menu').fadeOut(100);
		}
	},


	// Select Input
	'focus .icn-select select'(event) {
		$(event.target).parent().addClass('focus');
	},

	'blur .icn-select select'(event) {
		$(event.target).parent().removeClass('focus');
	},


	// Dropdown Button
	'click .js-dropdown'(event) {
		event.preventDefault();
		let menuId = $(event.currentTarget).attr('data-menu');

		$('.dropdown-menu, .list-item-dropdown-menu').not(menuId).fadeOut(100);

		if ($(menuId).is(':visible')) {
			$(menuId).fadeOut(100);
			$(menuId).removeAttr('style');
		} else {
			let maxMenuHeight = $('#__blaze-root').height() - 118;
			$(menuId).css({maxHeight: maxMenuHeight}).fadeIn(200);
		}
	},


	// Alerts
	'click .js-alert-close'(event) {
		event.preventDefault();
		const alertId = event.currentTarget.id

		$('#' + alertId).parent().addClass('alert-fade-out');
		setTimeout(function(){
			Alerts.remove({_id: alertId});
		}, 350);
	},

	// Show/Hide Help
	'click .js-show-help'(event) {
		event.preventDefault();

		let helpClass = '.' + $(event.currentTarget).attr('id');

		$('.js-show').show();
		$('.js-hide').hide();
		$('.js-info').slideUp('fast');

		if ($(event.currentTarget).hasClass('js-closed')) {
			$(event.currentTarget).removeClass('js-closed').addClass('js-open');
			$(event.currentTarget).find('.js-show').hide();
			$(event.currentTarget).find('.js-hide').show();
			$(helpClass).slideDown('fast');
		} else {
			$(event.currentTarget).removeClass('js-open').addClass('js-closed');
		}		
	},

	// Dialog Confirmations
	'click .js-dialog-cancel'(event) {
		event.preventDefault();
		const dialogId = Dialogs.findOne()._id;
		Dialogs.remove({_id: dialogId});
	},

	'click .js-delete-student-confirmed'(event) {
		event.preventDefault();
		$('.js-deleting').show();

		function nextPath(selectedStudentId) {
			let studentIds = Students.find({}, {sort: {birthday: 1, lastName: 1, firstName: 1}}).map(student => (student._id));
			let selectedIndex = studentIds.indexOf(selectedStudentId);
			let newIds = {};

			if (selectedIndex) {
				let firstStudentId = studentIds[selectedIndex - 1];
				newIds.firstStudentId = firstStudentId;
			} else {
				let firstStudentId = studentIds[selectedIndex + 1];
				newIds.firstStudentId = firstStudentId;
			}

			if (newIds.firstStudentId) {
				newIds.firstStudentId = newIds.firstStudentId;
			} else {
				newIds.firstStudentId = 'empty';
			}
			return newIds;
		};

		let newPath = nextPath(FlowRouter.getParam('selectedStudentId'));
		let dialogId = Dialogs.findOne()._id;

		Dialogs.remove({_id: dialogId});
		Meteor.call('deleteStudent', FlowRouter.getParam('selectedStudentId'), function(error) {
			if (error) {
				Alerts.insert({
					colorClass: 'bg-danger',
					iconClass: 'icn-danger',
					message: error.reason,
				});
			} else {
				Meteor.call('runPrimaryInitialIds', function(error) {
					if (error) {
						Alerts.insert({
							colorClass: 'bg-danger',
							iconClass: 'icn-danger',
							message: error.reason,
						});
					} else {
						Dialogs.remove({_id: dialogId});
						Session.set({
							'selectedStudentId': newPath.firstStudentId,
						})
						if (window.screen.availWidth > 768) {
							FlowRouter.go('/planning/students/view/3/' + newPath.firstStudentId);
						} else {
							FlowRouter.go('/planning/students/view/2/' + newPath.firstStudentId);
						}
						$('.js-deleting').hide();
					}
				})
			}
		});
	},
	
	'click .js-delete-school-year-confirmed'(event) {
		event.preventDefault();
		$('.js-deleting').show();

		function nextPath(selectedSchoolYearId) {
			let schoolYearIds = SchoolYears.find({}, {sort: {startYear: 1}}).map(schoolYear => (schoolYear._id));
			let selectedIndex = schoolYearIds.indexOf(selectedSchoolYearId);
			let newIds = {};

			if (selectedIndex) {
				let firstSchoolYearId = schoolYearIds[selectedIndex - 1];
				newIds.firstSchoolYearId = firstSchoolYearId;
			} else {
				let firstSchoolYearId = schoolYearIds[selectedIndex + 1];
				newIds.firstSchoolYearId = firstSchoolYearId;
			}
				
			let newPath = Paths.findOne({timeFrameId: newIds.firstSchoolYearId, type: 'schoolYear'});

			if (newPath) {
				newIds.newTermId = newPath.firstTermId;
				newIds.newWeekId = newPath.firstWeekId;
			} else {
				newIds.newTermId = 'empty';
				newIds.newWeekId = 'empty';
			}
			return newIds;
		};

		let newPath = nextPath(FlowRouter.getParam('selectedSchoolYearId'));
		let dialogId = Dialogs.findOne()._id;

		Dialogs.remove({_id: dialogId});
		Meteor.call('deleteSchoolYear', FlowRouter.getParam('selectedSchoolYearId'), function(error) {
			if (error) {
				Alerts.insert({
					colorClass: 'bg-danger',
					iconClass: 'icn-danger',
					message: error.reason,
				});
			} else {
				Meteor.call('runPrimaryInitialIds', function(error) {
					Dialogs.remove({_id: dialogId});
					Session.set({
						'selectedSchoolYearId': newPath.firstSchoolYearId,
						'selectedTermId': newPath.firstTermId,
						'selectedWeekId': newPath.firstWeekId,
					})
					if (window.screen.availWidth > 768) {
						FlowRouter.go('/planning/schoolyears/view/3/' + newPath.firstSchoolYearId);
					} else {
						FlowRouter.go('/planning/schoolyears/view/2/' + newPath.firstSchoolYearId);
					}
					$('.js-deleting').hide();
				});
			}
		});
	},
	
	'click .js-delete-subject-confirmed'(event) {
		event.preventDefault();
		$('.js-deleting').show();

		function nextSchoolWorkId(selectedSchoolWorkId) {
			let subjects = Subjects.find({schoolYearId: FlowRouter.getParam('selectedSchoolYearId'), studentId: FlowRouter.getParam('selectedStudentId')}).fetch();
			subjects.forEach(subject => subject.type = 'subjects');

			let workItems = SchoolWork.find({schoolYearId: FlowRouter.getParam('selectedSchoolYearId'), studentId: FlowRouter.getParam('selectedStudentId'), subjectId: {$exists: false}}).fetch();
			workItems.forEach(workItem => workItem.type = 'work');

			let schoolWork = _.sortBy(subjects.concat(workItems), ['name'])
			let schoolWorkIds = schoolWork.map(schoolWork => (schoolWork._id));
			let selectedIndex = schoolWorkIds.indexOf(selectedSchoolWorkId);

			if (selectedIndex) {
				return {
					_id: schoolWorkIds[selectedIndex - 1],
					type: schoolWork.find(work => work._id === schoolWorkIds[selectedIndex - 1]).type
				}
			}
			return {
				_id: schoolWorkIds[selectedIndex + 1],
				type: schoolWork.find(work => work._id === schoolWorkIds[selectedIndex + 1]).type
			}
		}

		let newSchoolWork = nextSchoolWorkId(FlowRouter.getParam('selectedSubjectId'));
		let dialogId = Dialogs.findOne()._id;

		let pathProperties = {
			studentIds: [FlowRouter.getParam('selectedStudentId')],
			schoolYearIds: [FlowRouter.getParam('selectedSchoolYearId')],
			termIds: Terms.find({schoolYearId: FlowRouter.getParam('selectedSchoolWorkId')}).map(term => term.termId),
		}

		let statProperties = {
			studentIds: [FlowRouter.getParam('selectedStudentId')],
			schoolYearIds: [FlowRouter.getParam('selectedSchoolYearId')],
			termIds: Terms.find({schoolYearId: FlowRouter.getParam('selectedSchoolWorkId')}).map(term => term.termId),
			weekIds: Weeks.find({}).map(week => week._id),
		}

		Dialogs.remove({_id: dialogId});
		Meteor.call('deleteSubject', FlowRouter.getParam('selectedSubjectId'), function(error) {
			if (error) {
				Alerts.insert({
					colorClass: 'bg-danger',
					iconClass: 'icn-danger',
					message: error.reason,
				});
			} else {
				Meteor.call('runUpsertSchoolWorkPathsAndStats', pathProperties, statProperties, function(error, result) {
					if (error) {
						Alerts.insert({
							colorClass: 'bg-danger',
							iconClass: 'icn-danger',
							message: error.reason,
						});
					} else {
						Session.set('selectedSchoolWorkId', newSchoolWork._id);
						Session.set('selectedSchoolWorkType', 'work');
						if (window.screen.availWidth > 768) {
							FlowRouter.go('/planning/' + newSchoolWork.type + '/view/3/' + FlowRouter.getParam('selectedStudentId') +'/'+ FlowRouter.getParam('selectedSchoolYearId') +'/'+ newSchoolWork._id);
						} else {
							FlowRouter.go('/planning/' + newSchoolWork.type + '/view/2/' + FlowRouter.getParam('selectedStudentId') +'/'+ FlowRouter.getParam('selectedSchoolYearId') +'/'+ newSchoolWork._id);
						}
						$('.js-deleting').hide();
					}
				});
			}
		});

		Dialogs.remove({_id: dialogId});
	},
	
	'click .js-delete-schoolWork-confirmed'(event) {
		event.preventDefault();
		$('.js-deleting').show();

		function nextSchoolWorkId(selectedSchoolWorkId) {
			let selectedSchoolWork = SchoolWork.findOne({_id: selectedSchoolWorkId});

			// selectedSchoolWork has subjectId?
			if (selectedSchoolWork.subjectId) {
				let schoolWorkIds = SchoolWork.find({subjectId: selectedSchoolWork.subjectId}, {sort: {name: 1}}).map(schoolWork => (schoolWork._id));
				let selectedIndex = schoolWorkIds.indexOf(selectedSchoolWorkId);

				if (selectedIndex) {
					return {
						_id: schoolWorkIds[selectedIndex - 1],
						type: "work",
					};
				}
				return {
					_id: selectedSchoolWork.subjectId,
					type: "subjects",
				};
			} else {
				let subjects = Subjects.find({schoolYearId: FlowRouter.getParam('selectedSchoolYearId'), studentId: FlowRouter.getParam('selectedStudentId')}).fetch();
				subjects.forEach(subject => subject.type = 'subjects');

				let workItems = SchoolWork.find({schoolYearId: FlowRouter.getParam('selectedSchoolYearId'), studentId: FlowRouter.getParam('selectedStudentId'), subjectId: {$exists: false}}).fetch();
				workItems.forEach(workItem => workItem.type = 'work');

				let schoolWork = _.sortBy(subjects.concat(workItems), ['name'])
				let schoolWorkIds = schoolWork.map(schoolWork => (schoolWork._id));
				let selectedIndex = schoolWorkIds.indexOf(selectedSchoolWorkId);

				if (selectedIndex) {
					return {
						_id: schoolWorkIds[selectedIndex - 1],
						type: schoolWork.find(work => work._id === schoolWorkIds[selectedIndex - 1]).type
					}
				}
				return {
					_id: schoolWorkIds[selectedIndex + 1],
					type: schoolWork.find(work => work._id === schoolWorkIds[selectedIndex + 1]).type
				}
			}
		};

		let newSchoolWork = nextSchoolWorkId(FlowRouter.getParam('selectedSchoolWorkId'));
		let dialogId = Dialogs.findOne()._id;

		let pathProperties = {
			studentIds: [FlowRouter.getParam('selectedStudentId')],
			schoolYearIds: [FlowRouter.getParam('selectedSchoolYearId')],
			termIds: Terms.find({schoolYearId: FlowRouter.getParam('selectedSchoolWorkId')}).map(term => term.termId),
		}

		let statProperties = {
			studentIds: [FlowRouter.getParam('selectedStudentId')],
			schoolYearIds: [FlowRouter.getParam('selectedSchoolYearId')],
			termIds: Terms.find({schoolYearId: FlowRouter.getParam('selectedSchoolWorkId')}).map(term => term.termId),
			weekIds: Weeks.find({}).map(week => week._id),
		}

		Dialogs.remove({_id: dialogId});
		Meteor.call('deleteSchoolWork', FlowRouter.getParam('selectedSchoolWorkId'), function(error) {
			if (error) {
				Alerts.insert({
					colorClass: 'bg-danger',
					iconClass: 'icn-danger',
					message: error.reason,
				});
			} else {
				Meteor.call('runUpsertSchoolWorkPathsAndStats', pathProperties, statProperties, function(error, result) {
					if (error) {
						Alerts.insert({
							colorClass: 'bg-danger',
							iconClass: 'icn-danger',
							message: error.reason,
						});
					} else {
						Session.set('selectedSchoolWorkId', newSchoolWork._id);
						Session.set('selectedSchoolWorkType', 'work');
						if (window.screen.availWidth > 768) {
							FlowRouter.go('/planning/' + newSchoolWork.type + '/view/3/' + FlowRouter.getParam('selectedStudentId') +'/'+ FlowRouter.getParam('selectedSchoolYearId') +'/'+ newSchoolWork._id);
						} else {
							FlowRouter.go('/planning/' + newSchoolWork.type + '/view/2/' + FlowRouter.getParam('selectedStudentId') +'/'+ FlowRouter.getParam('selectedSchoolYearId') +'/'+ newSchoolWork._id);
						}
						$('.js-deleting').hide();
					}
				});
			}
		});
	},

	'click .js-delete-resource-confirmed'(event) {
		event.preventDefault();
		$('.js-deleting').show();

		function nextResourceId(selectedResourceId) {
			let resourceIds = Resources.find({}, {sort: {title: 1}}).map(resource => (resource._id));

			if (resourceIds.length > 1) {
				let selectedIndex = resourceIds.indexOf(selectedResourceId);
				if (selectedIndex) {
					return Resources.findOne({_id: resourceIds[selectedIndex - 1]});
				}
				return Resources.findOne({_id: resourceIds[selectedIndex + 1]});
			}
			return {_id: 'empty', type: 'empty'}
		};

		let newResource = nextResourceId(FlowRouter.getParam('selectedResourceId'))
		const dialogId = Dialogs.findOne()._id;

		Dialogs.remove({_id: dialogId});
		Meteor.call('deleteResource', FlowRouter.getParam('selectedResourceId'), function(error) {
			if (error) {
				Alerts.insert({
					colorClass: 'bg-danger',
					iconClass: 'icn-danger',
					message: error.reason,
				});
			} else {
				Session.set({
					'selectedResourceId': newResource._id,
					'selectedResourceType': newResource.type
				});
				if (window.screen.availWidth > 768) {
					FlowRouter.go('/planning/resources/view/3/' + FlowRouter.getParam('selectedResourceType') +'/'+ FlowRouter.getParam('selectedResourceAvailability') +'/'+ newResource._id +'/'+ newResource.type);
				} else {
					FlowRouter.go('/planning/resources/view/2/' + FlowRouter.getParam('selectedResourceType') +'/'+ FlowRouter.getParam('selectedResourceAvailability') +'/'+ newResource._id +'/'+ newResource.type);
				}
				$('.js-deleting').hide();
			}
		});
	},

	'click .js-delete-segment-confirmed'(event) {
		event.preventDefault();
		
		$('.js-deleting').show();

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
		let deleteLessonIds = []

		$('.js-segment-checkbox').each(function() {
			if ($(this).val().trim() === 'true') {
				batchCheckedLessonProperties.push({ 
					_id: $(this).attr('data-lesson-id'),
					schoolWorkId: $(this).attr('data-schoolWork-id')
				});
				deleteLessonIds.push($(this).attr('data-lesson-id'))
			}
		});

		// Get Unchecked Lessons from School Work with Checked Lesson
		let schoolWorkIds = _.uniq(batchCheckedLessonProperties.map(lesson => lesson.schoolWorkId));
		let batchUncheckedLessonProperties = [];

		schoolWorkIds.forEach(workId => {
			$('#js-work-track-' + workId).find('.js-segment-checkbox').each(function() {
				if ($(this).val().trim() != 'true') {
					batchUncheckedLessonProperties.push({ 
						_id: $(this).attr('data-lesson-id'),
						schoolWorkId: $(this).attr('data-schoolWork-id')
					})
				}
			})
		})

		// Get Notes to be Edited
		let deleteNoteIds = [];

		schoolWorkIds.forEach(workId => {
			let unchecked = $('#js-work-track-' + workId).find('.js-segment-checkbox').not(':checked').length;
			if (unchecked === 0) {
				let note = Notes.findOne({schoolWorkId: workId, weekId: FlowRouter.getParam('selectedWeekId')});
				if (note) {
					deleteNoteIds.push(note._id);
				}
			}
		});


		// Reorder Unchecked Lessons
		schoolWorkIds.forEach(workId => {
			let lessons = _.filter(batchUncheckedLessonProperties, {'schoolWorkId': workId});
			lessons.forEach((lesson, index) => {
				lesson.order = index + 1
			});
		});

		let dialogId = Dialogs.findOne()._id;
		Dialogs.remove({_id: dialogId});
		Meteor.call('deleteLessons', deleteLessonIds, _.uniq(deleteNoteIds), function(error, result) {
			if (error) {
				Alerts.insert({
					colorClass: 'bg-danger',
					iconClass: 'icn-danger',
					message: error.reason,
				});
				$('.js-deleting').hide();
				$('.js-submit').prop('disabled', false);
			} else {
				Meteor.call('batchUpdateLessons', batchUncheckedLessonProperties, [], function(error, result) {
					if (error) {
						Alerts.insert({
							colorClass: 'bg-danger',
							iconClass: 'icn-danger',
							message: error.reason,
						});
						$('.js-deleting').hide();
						$('.js-submit').prop('disabled', false);
					} else {
						Meteor.call('runUpsertSchoolWorkPathsAndStats', pathProperties, statProperties, function() {
							if (error) {
								Alerts.insert({
									colorClass: 'bg-danger',
									iconClass: 'icn-danger',
									message: error.reason,
								});
								$('.js-deleting').hide();
								$('.js-submit').prop('disabled', false);
							} else {
								FlowRouter.go('/tracking/students/view/2/' + FlowRouter.getParam('selectedStudentId') +'/'+ FlowRouter.getParam('selectedSchoolYearId') +'/'+ FlowRouter.getParam('selectedTermId') +'/'+ FlowRouter.getParam('selectedWeekId'))
							}
						})
					}
				});
			}
		});
	},

	'click .js-delete-report-confirmed'(event) {
		event.preventDefault();
		$('.js-deleting').show();

		function nextReportId(selectedReportId) {
			let reportIds = Reports.find({}, {sort: {name: 1}}).map(report => (report._id));
			let selectedIndex = reportIds.indexOf(selectedReportId);

			if (reportIds.length === 1) {
				return 'empty';
			}
			if (selectedIndex) {
				return reportIds[selectedIndex - 1]
			}
			return reportIds[selectedIndex + 1]
		};

		let newReportId = nextReportId(FlowRouter.getParam('selectedReportId'));
		let dialogId = Dialogs.findOne()._id;

		Dialogs.remove({_id: dialogId});
		Meteor.call('deleteReport', FlowRouter.getParam('selectedReportId'), function(error) {
			if (error) {
				Alerts.insert({
					colorClass: 'bg-danger',
					iconClass: 'icn-danger',
					message: error.reason,
				});
			} else {
				Session.set('selectedReportId', newReportId);
				if (window.screen.availWidth > 768) {
					FlowRouter.go('/reporting/view/2/' + Session.get('selectedStudentId') +"/"+ Session.get('selectedSchoolYearId') +'/'+ Session.get('selectedReportingTermId') +'/'+ Session.get('selectedReportingWeekId') +"/"+ newReportId);
				} else {
					FlowRouter.go('/reporting/view/1/' + Session.get('selectedStudentId') +"/"+ Session.get('selectedSchoolYearId') +'/'+ Session.get('selectedReportingTermId') +'/'+ Session.get('selectedReportingWeekId') +"/"+ newReportId);
				}
				$('.js-deleting').hide();
			}
		});
	},

	'click .js-delete-user-confirmed'(event) {
		event.preventDefault();
		$('.js-deleting').show();

		let dialogId = Dialogs.findOne()._id;
		let nextUserId = Meteor.users.findOne({'emails.0.verified': true, 'status.active': true})._id

		Dialogs.remove({_id: dialogId});
		Meteor.call('removeUser', FlowRouter.getParam('selectedUserId'), function(error) {
			if (error) {
				Alerts.insert({
					colorClass: 'bg-danger',
					iconClass: 'icn-danger',
					message: error.reason,
				});
			} else {
				Dialogs.remove({_id: dialogId});
				Session.set('selectedUserId', nextUserId);
				if (window.screen.availWidth > 768) {
					FlowRouter.go('/settings/users/view/3/' + nextUserId);
				} else {
					FlowRouter.go('/settings/users/view/2/' + nextUserId);
				}
				$('.js-deleting').hide();
			}
		});
	},

	'click .js-reset-password-confirmed'(event) {
		event.preventDefault();
		
		$('.js-signing-out').show();
		Dialogs.remove({});

		Accounts.logout(function(error) {
			if (error) {
				Alerts.insert({
					colorClass: 'bg-danger',
					iconClass: 'icn-danger',
					message: error.reason,
				});
			} else {
				FlowRouter.go("/reset");
			}
		});
	},

	// Add Resource to School Work
	'click .js-close-resource-popover'(event) {
		event.preventDefault();

		document.getElementsByClassName('js-form-new-resource')[0].reset();
		document.getElementsByClassName('js-form-new-resource')[0].getElementsByClassName('editor-content')[0].innerHTML = '';
		if (Session.get('currentType') != 'link') {
			document.getElementsByClassName('js-form-new-resource')[0].getElementsByClassName('js-radio-own')[0].checked = true;
		}
		document.getElementsByClassName('popover-content')[0].scrollTop = 0;
		document.getElementsByClassName('js-resource-popover')[0].classList.add('hide');
	},

	'click .js-create-attach'(event) {
		event.preventDefault();
		$('.js-form-new-resource').submit();
	},



	// List Selections
	'click .js-user'(event) {
		Session.set({
			selectedUserId: $(event.currentTarget).attr('id'),
			editUrl: '/settings/users/edit/3/' + $(event.currentTarget).attr('id'),
		});
	},

	'click .js-student'(event) {
		let studentId = $(event.currentTarget).attr('id');

		function selectedItem(item) {
			if (_.isUndefined(item)) {
				return 'empty';
			}
			return item;
		}

		let path = Paths.findOne({studentId: studentId, timeFrameId: Session.get('selectedSchoolYearId')});
		
		if (FlowRouter.current().route.name === 'workView') {
			Session.set('editUrl', '/planning/work/edit/3/' + studentId +'/'+ Session.get('selectedSchoolYearId') +'/'+ selectedItem(path.firstSchoolWorkId));
		} else if (FlowRouter.current().route.name === 'trackingView' || FlowRouter.current().route.name === 'trackingEdit') {
			Session.set('editUrl', '/tracking/students/edit/2/' + studentId +'/'+ Session.get('selectedSchoolYearId') +'/'+ FlowRouter.getParam('selectedTermId') +'/'+ FlowRouter.getParam('selectedWeekId'))
		} else if (FlowRouter.current().route.name === 'reportingView') {
			Session.set('editUrl', 'http://localhost:3000/reporting/edit/2/' + reportId);
		} else {
			Session.set('editUrl', '/planning/students/edit/3/' + studentId);
		}

		Session.set({
			selectedStudentId: studentId,
			selectedTermId: selectedItem(path.firstTermId),
			selectedWeekId: selectedItem(path.firstWeekId),
			selectedSchoolWorkId: selectedItem(path.firstSchoolWorkId),
			selectedSchoolWorkType: selectedItem(path.firstSchoolWorkType),
			selectedReportingTermId: selectedItem(path.firstTermId),
			selectedReportingWeekId: selectedItem(path.firstWeekId),
		});
	},

	'click .js-school-year'(event) {
		let schoolYearId = $(event.currentTarget).attr('id');

		function selectedItem(item) {
			if (_.isUndefined(item)) {
				return 'empty';
			}
			return item;
		}

		let path = Paths.findOne({studentId: Session.get('selectedStudentId'), timeFrameId: schoolYearId});

		if (FlowRouter.current().route.name === 'workView') {
			Session.set('editUrl', '/planning/work/edit/3/' + Session.get('selectedStudentId') +'/'+ schoolYearId +'/'+ selectedItem(path.firstSchoolWorkId));
		} else if (FlowRouter.current().route.name === 'reportingView') {
			Session.set('editUrl', 'http://localhost:3000/reporting/edit/2/' + reportId);
		} else {
			Session.set('editUrl', '/planning/schoolyears/edit/3/' + schoolYearId);
		}

		Session.set({
			selectedSchoolYearId: schoolYearId,
			selectedTermId: selectedItem(path.firstTermId),
			selectedWeekId: selectedItem(path.firstWeekId),
			selectedSchoolWorkId: selectedItem(path.firstSchoolWorkId),
			selectedSchoolWorkType: selectedItem(path.firstSchoolWorkType),
			selectedReportingTermId: selectedItem(path.firstTermId),
			selectedReportingWeekId: selectedItem(path.firstWeekId),
		});
	},

	'click .js-term'(event) {
		let termId = $(event.currentTarget).attr('id');

		function selectedItem(item) {
			if (_.isUndefined(item)) {
				return 'empty';
			}
			return item;
		}

		let path = Paths.findOne({studentId: Session.get('selectedStudentId'), timeFrameId: termId});
		
		if (termId === 'allTerms') {
			Session.set({
				selectedReportingTermId: 'allTerms',
				selectedReportingWeekId: 'allWeeks',
			});
		} else {
			Session.set({
				selectedTermId: termId,
				selectedWeekId: selectedItem(path.firstWeekId),
				selectedReportingTermId: termId,
				selectedReportingWeekId: selectedItem(path.firstWeekId),
			});
		}
	},

	'click .js-week'(event) {
		let weekId = $(event.currentTarget).attr('id');
		if (weekId === 'allWeeks') {
			Session.set('selectedReportingWeekId', 'allWeeks');
		} else {
			Session.set('selectedWeekId', weekId);
			Session.set('selectedReportingWeekId', weekId);
		}
		
	},

	'click .js-resource'(event) {
		Session.set({
			selectedResourceId: $(event.currentTarget).attr('id'),
			selectedResourceCurrentTypeId: $(event.currentTarget).attr('data-resource-type'),
			editUrl: '/planning/resources/edit/3/' + Session.get('selectedResourceType') +'/'+ Session.get('selectedResourceAvailability') +'/'+ $(event.currentTarget).attr('id') +'/'+ $(event.currentTarget).attr('data-resource-type'),
		});
	},

	'click .js-type'(event) {
		Session.set({
			selectedResourceType: $(event.currentTarget).attr('data-resource-type'),
			selectedResourceId: $(event.currentTarget).attr('id'),
			selectedResourceCurrentTypeId: $(event.currentTarget).attr('data-resource-type'),
			editUrl: '/planning/resources/edit/3/' + $(event.currentTarget).attr('data-resource-type') +'/'+ Session.get('selectedResourceAvailability') +'/'+ $(event.currentTarget).attr('id') +'/'+ $(event.currentTarget).attr('data-resource-type'),
		});
	},

	'click .js-availability'(event) {
		Session.set({
			selectedResourceAvailability: $(event.currentTarget).attr('data-resource-availability'),
			selectedResourceId: $(event.currentTarget).attr('id'),
			selectedResourceCurrentTypeId: $(event.currentTarget).attr('data-resource-type'),
			editUrl: '/planning/resources/edit/3/' + $(event.currentTarget).attr('data-resource-type') +'/'+ $(event.currentTarget).attr('data-resource-availability') +'/'+ $(event.currentTarget).attr('id') +'/'+ $(event.currentTarget).attr('data-resource-type'),
		});
	},

	'click .js-new-resource'(event) {
		Session.set({
			selectedResourceType: 'all',
			selectedResourceAvailability: 'all',
		});
	},

	'click .js-subject'(event) {
		Session.set({
			selectedStudentId: $(event.currentTarget).attr('data-subject-student'),
			selectedSchoolYearId: $(event.currentTarget).attr('data-subject-school-Year'),
			selectedSchoolWorkId: $(event.currentTarget).attr('id'),
			selectedSchoolWorkType: 'subjects',
			editUrl: '/planning/subjects/edit/3/' + $(event.currentTarget).attr('data-subject-student') +'/'+ $(event.currentTarget).attr('data-subject-school-Year') +'/'+ $(event.currentTarget).attr('id'),
		});
	},

	'click .js-work'(event) {
		Session.set({
			selectedStudentId: $(event.currentTarget).attr('data-work-student'),
			selectedSchoolYearId: $(event.currentTarget).attr('data-work-school-Year'),
			selectedSchoolWorkId: $(event.currentTarget).attr('id'),
			selectedSchoolWorkType: 'work',
			editUrl: '/planning/work/edit/3/' + $(event.currentTarget).attr('data-work-student') +'/'+ $(event.currentTarget).attr('data-work-school-Year') +'/'+ $(event.currentTarget).attr('id'),
		});
	},

	'click .js-report'(event) {
		Session.set({
			selectedReportId: $(event.currentTarget).attr('id'),
			editUrl: '/reporting/edit/2/' + $(event.currentTarget).attr('id'),
		});
	},
});









