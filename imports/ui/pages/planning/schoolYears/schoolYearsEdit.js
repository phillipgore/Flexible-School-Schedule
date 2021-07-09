import {Template} from 'meteor/templating';
import './schoolYearsEdit.html';

import { SchoolYears } from '../../../../api/schoolYears/schoolYears.js';
import { Terms } from '../../../../api/terms/terms.js';
import { SchoolWork } from '../../../../api/schoolWork/schoolWork.js';
import { Weeks } from '../../../../api/weeks/weeks.js';
import { Lessons } from '../../../../api/lessons/lessons.js';
import { Stats } from '../../../../api/stats/stats.js';
import {yearValidation} from '../../../../modules/functions';

LocalTerms = new Mongo.Collection(null);
LocalWeeks = new Mongo.Collection(null);
import _ from 'lodash'

Template.schoolYearsEdit.onCreated( function() {
	let template = Template.instance();

	template.autorun( () => {
		this.schoolYearData = Meteor.subscribe('schoolYearEdit', FlowRouter.getParam('selectedSchoolYearId'));
	})
});

Template.schoolYearsEdit.onRendered( function() {
	// Toolbar Settings
	Session.set({
		toolbarType: 'edit',
		labelThree: 'Edit School Year',
		activeNav: 'planningList',
	});
	
	// Term Input Settings
	LocalTerms.remove({});
	LocalTerms.insert({term: true});

	// Week Input Settings
	LocalWeeks.remove({});
})

Template.schoolYearsEdit.helpers({
	subscriptionReady: function() {
		return Template.instance().schoolYearData.ready();
	},

	schoolYear: function() {
		return SchoolYears.findOne({_id: FlowRouter.getParam('selectedSchoolYearId')});
	},

	terms: function() {
		return Terms.find({schoolYearId: FlowRouter.getParam('selectedSchoolYearId')});
	},

	weeks: function() {
		return Weeks.find({schoolYearId: FlowRouter.getParam('selectedSchoolYearId')});
	},

	weeksCount: function() {
		return Weeks.find({schoolYearId: FlowRouter.getParam('selectedSchoolYearId')}).count();
	},

	termWeeks: function(termId) {
		return Weeks.find({termId: termId}, {sort: {order: 1}});
	},

	getStatus: function(timeFrameId) {
		let status = Stats.findOne({timeFrameId: timeFrameId}) && Stats.findOne({timeFrameId: timeFrameId}).status;

		if (status === 'empty' || _.isUndefined(status)) {
			return 'icn-open-circle txt-gray-darker';
		}
		if (status === 'pending') {
			return 'icn-circle txt-gray-darker';
		}
		if (status === 'partial') {
			return 'icn-circle txt-secondary';
		}
		if (status === 'assigned') {
			return 'icn-circle txt-warning';
		}
		if (status === 'completed') {
			return 'icn-circle txt-primary';
		}
	},

	getDeletableStatus: function(timeFrameId) {
		let status = Stats.findOne({timeFrameId: timeFrameId}) && Stats.findOne({timeFrameId: timeFrameId}).status;

		if (status === 'pending' || status === 'empty' || _.isUndefined(status)) {
			return 'bg-danger js-deletable';
		}
		return 'bg-gray-dark';
	},

	localTerms: function() {
		return LocalTerms.find();
	},

	localTermWeeks: function(termId) {
		return LocalWeeks.find({termId: termId});
	},

	localWeeksIndexIncrement: function(index, termId) {
		return Weeks.find({termId: termId}).count() + index + 1;
	},

	indexIncrement: function(index) {
		return Terms.find({schoolYearId: FlowRouter.getParam('selectedSchoolYearId')}).count() + index + 1;
	}
});

Template.schoolYearsEdit.events({
	'keyup .js-start-year'(event) {
		event.preventDefault();

		if (yearValidation(event.target.value.trim())) {
			$('.js-start-year').removeClass('error');
			$('.js-start-year-errors').text('');
			$('.js-submit').prop('disabled', false);
		} else {
			$('.js-start-year').addClass('error');
			$('.js-start-year-errors').text('Must be a 4 digit year.').show();
			$('.js-submit').prop('disabled', true);
		}
	},

	'keyup .js-end-year'(event) {
		event.preventDefault();

		if (yearValidation(event.target.value.trim())) {
			$('.js-end-year').removeClass('error');
			$('.js-end-year-errors').text('');
			$('.js-submit').prop('disabled', false);
		} else {
			$('.js-end-year').addClass('error');
			$('.js-end-year-errors').text('Must be a 4 digit year.').show();
			$('.js-submit').prop('disabled', true);
		}
	},

	'click .js-term-toggle'(event) {
		event.preventDefault();
		let listId = '#' + $(event.currentTarget).attr('data-term-index');

		if ($(listId).is(':visible')) {
			$(event.currentTarget).find('.js-caret-right').show();
			$(event.currentTarget).find('.js-caret-down').hide();
			$(listId).slideUp(100);
		} else {
			$(event.currentTarget).find('.js-caret-right').hide();
			$(event.currentTarget).find('.js-caret-down').show();
			$(listId).slideDown(200);
		}
	},


	// Remove and Restore Exiting Term
	'click .js-remove-term'(event) {
		event.preventDefault();
		let termParent = $(event.currentTarget).parentsUntil('.js-term-toggle').parent();
		let listId = '#' + $(termParent).attr('data-term-index');

		if ($(event.currentTarget).find('.btn').hasClass('js-deletable')) {
			if ($(listId).is(':visible')) {
				event.stopPropagation();
			}
			$(termParent).addClass('set-to-delete').find('.js-remove-term').hide()
			$(termParent).find('.js-restore-term').show();
			$(listId).find('.js-week-item').addClass('set-to-delete');
			$(listId).find('.js-remove-week').hide();
			$(listId).find('.js-restore-week').show();
		} else {
			event.stopPropagation();
			Alerts.insert({
				colorClass: 'bg-danger',
				iconClass: 'icn-danger',
				message: 'You may not delete this term. It would remove segments you have already worked on it.',
			});
		}

		let totalWeeks = $('.js-week-item').not('.set-to-delete').length;

		$('.js-term-inputs').find('.js-weeks-per-term').each(function() {
			if ($(this).val()) {
				totalWeeks = totalWeeks + parseInt($(this).val());
			}
		});

		$('.js-total-weeks').html(totalWeeks);
		if ( totalWeeks > 52 && !Alerts.find({type: 'terms'}).count() ) {
			Alerts.insert({
				type: 'terms',
				colorClass: 'bg-warning',
				iconClass: 'icn-warning',
				message: "You have exceeded 52 weeks.",
			});
		}
	},

	'click .js-restore-term'(event) {
		event.preventDefault();
		let termParent = $(event.currentTarget).parentsUntil('.js-term-toggle').parent();
		let listId = '#' + $(termParent).attr('data-term-index');

		if ($(listId).is(':visible')) {
			event.stopPropagation();
		}
		$(termParent).removeClass('set-to-delete').find('.js-restore-term').hide()
		$(termParent).find('.js-remove-term').show();
		$(listId).find('.js-week-item').removeClass('set-to-delete');
		$(listId).find('.js-remove-week').show();
		$(listId).find('.js-restore-week').hide();

		let totalWeeks = $('.js-week-item').not('.set-to-delete').length;
		$('.js-term-inputs').find('.js-weeks-per-term').each(function() {
			if ($(this).val()) {
				totalWeeks = totalWeeks + parseInt($(this).val());
			}
		});

		$('.js-total-weeks').html(totalWeeks);
		if ( totalWeeks > 52 && !Alerts.find({type: 'terms'}).count() ) {
			Alerts.insert({
				type: 'terms',
				colorClass: 'bg-warning',
				iconClass: 'icn-warning',
				message: "You have exceeded 52 weeks.",
			});
		}
	},


	// Remove and Restore Existing Week
	'click .js-remove-week'(event) {
		event.preventDefault();
		let weekListParent = $(event.currentTarget).parentsUntil('.js-week-list').parent();
		let termId = $(weekListParent).attr('data-term-id');
		let termParent = $('.js-term-toggle[id="' + termId + '"]');
		let weekParent = $(event.currentTarget).parentsUntil('.js-week-item').parent();

		if ($(event.currentTarget).find('.btn').hasClass('js-deletable')) {
			$(weekParent).addClass('set-to-delete')
			$(weekParent).find('.js-remove-week').hide()
			$(weekParent).find('.js-restore-week').show();

			if (!$(weekListParent).find('.js-week-item').not('.set-to-delete').length) {
				$(termParent).addClass('set-to-delete');
				$(termParent).find('.js-remove-term').hide();
				$(termParent).find('.js-restore-term').show();
			}
		} else {
			Alerts.insert({
				colorClass: 'bg-danger',
				iconClass: 'icn-danger',
				message: 'You may not delete this week. It would remove segments you have already worked on it.',
			});
		}

		let totalWeeks = $('.js-week-item').not('.set-to-delete').length;
		$('.js-term-inputs').find('.js-weeks-per-term').each(function() {
			if ($(this).val()) {
				totalWeeks = totalWeeks + parseInt($(this).val());
			}
		});

		$('.js-total-weeks').html(totalWeeks);
		if ( totalWeeks > 52 && !Alerts.find({type: 'terms'}).count() ) {
			Alerts.insert({
				type: 'terms',
				colorClass: 'bg-warning',
				iconClass: 'icn-warning',
				message: "You have exceeded 52 weeks.",
			});
		}
	},

	'click .js-restore-week'(event) {
		event.preventDefault();
		let weekListParent = $(event.currentTarget).parentsUntil('.js-week-list').parent();
		let termId = $(weekListParent).attr('data-term-id');
		let termParent = $('.js-term-toggle[id="' + termId + '"]');
		let weekParent = $(event.currentTarget).parentsUntil('.js-week-item').parent();

		$(weekParent).removeClass('set-to-delete')
		$(weekParent).find('.js-restore-week').hide()
		$(weekParent).find('.js-remove-week').show();

		if ($(weekListParent).find('.js-week-item').not('.set-to-delete').length) {
			$(termParent).removeClass('set-to-delete');
			$(termParent).find('.js-restore-term').hide();
			$(termParent).find('.js-remove-term').show();
		}

		let totalWeeks = $('.js-week-item').not('.set-to-delete').length;
		$('.js-term-inputs').find('.js-weeks-per-term').each(function() {
			if ($(this).val()) {
				totalWeeks = totalWeeks + parseInt($(this).val());
			}
		});

		$('.js-total-weeks').html(totalWeeks);
		if ( totalWeeks > 52 && !Alerts.find({type: 'terms'}).count() ) {
			Alerts.insert({
				type: 'terms',
				colorClass: 'bg-warning',
				iconClass: 'icn-warning',
				message: "You have exceeded 52 weeks.",
			});
		}
	},


	// New Week for Existing Term
	'click .js-insert-week'(event) {
		event.preventDefault();

		let termId = $(event.currentTarget).attr('data-term-id');
		let termParent = $('.js-term-toggle[id="' + termId + '"]');

		LocalWeeks.insert({termId: termId});

		$(termParent).removeClass('set-to-delete');
		$(termParent).find('.js-restore-term').hide();
		$(termParent).find('.js-remove-term').show();

		let totalWeeks = $('.js-week-item').not('.set-to-delete').length;
		$('.js-term-inputs').find('.js-weeks-per-term').each(function() {
			if ($(this).val()) {
				totalWeeks = totalWeeks + parseInt($(this).val());
			}
		});

		$('.js-total-weeks').html(totalWeeks);
		if ( totalWeeks > 52 && !Alerts.find({type: 'terms'}).count() ) {
			Alerts.insert({
				type: 'terms',
				colorClass: 'bg-warning',
				iconClass: 'icn-warning',
				message: "You have exceeded 52 weeks.",
			});
		}
	},


	// New Terms and Weeks
	'keyup .js-weeks-per-term'(event) {
		let valueCount = [];
		let totalWeeks = $('.js-week-item').not('.set-to-delete').length;
		$('.js-term-inputs').find('.js-weeks-per-term').each(function() {
			if ($(this).val()) {
				valueCount.push($(this).val());
				totalWeeks = totalWeeks + parseInt($(this).val());
			}
		});

		$('.js-total-weeks').html(totalWeeks);		
		if ( totalWeeks > 52 && !Alerts.find({type: 'terms'}).count() ) {
			Alerts.insert({
				type: 'terms',
				colorClass: 'bg-warning',
				iconClass: 'icn-warning',
				message: "You have exceeded 52 weeks.",
			});
		}

		let localTermCount = LocalTerms.find().count()
		if (valueCount.length === localTermCount) {
			LocalTerms.insert({term: true});
		}
	},

	'click .js-new-term-remove'(event) {
		event.preventDefault();

		let localTermId = event.currentTarget.id		
		if (localTermId === $('.js-term-input:last .js-new-term-remove').attr('id')) {
			$('.js-term-input:last .js-weeks-per-term').val('')
		} else {
			LocalTerms.remove({_id: localTermId})
		}

		let totalWeeks = $('.js-week-item').not('.set-to-delete').length;
		$('.js-term-inputs').find('.js-weeks-per-term').each(function() {
			if ($(this).val()) {
				totalWeeks = totalWeeks + parseInt($(this).val());
			}
		});

		$('.js-total-weeks').html(totalWeeks);
		if ( totalWeeks > 52 && !Alerts.find({type: 'terms'}).count() ) {
			Alerts.insert({
				type: 'terms',
				colorClass: 'bg-warning',
				iconClass: 'icn-warning',
				message: "You have exceeded 52 weeks.",
			});
		}
	},


	// Submit and Cancel Form
	'submit .js-form-school-year-edit'(event) {
		event.preventDefault();

		$('.js-updating').show();
		$('.js-submit').prop('disabled', true);

		// School Year Properties
		let schoolYearProperties = {
			startYear: event.target.startYear.value.trim(),
			endYear: event.target.endYear.value.trim(),
		};


		/* -------------------- Deletes -------------------- */
		// Term Deletes
		let termDeletes = []
		document.querySelectorAll('.js-term-item.set-to-delete').forEach(term => {termDeletes.push(term.getAttribute('id'))});
		let termDeleteIds = termDeletes.filter(week => week != null && week != "");


		// Week Deletes
		let weekDeletes = []
		document.querySelectorAll('.js-existing-week-item.set-to-delete').forEach(week => {weekDeletes.push(week.getAttribute('id'))});
		let weekDeleteIds = weekDeletes.filter(week => week != null && week != "");


		/* -------------------- Updates -------------------- */
		// Term Ids
		let termIds = []
		document.querySelectorAll('.js-term-item').forEach((term, index) => {
			if (!term.classList.contains('set-to-delete')) {
				termIds.push(term.getAttribute('id'))
			}
		});


		// Term Updates
		let termUpdateProperties = []
		if (termDeleteIds.length) {
			termIds.forEach((termId, index) => {
				let newOrder = index + 1;
				termUpdateProperties.push({_id: termId, order: parseInt(newOrder)})
			});
		}


		// Term & Week Ids
		let weekIds = []
		let termIdsWithWeekUpdates = []
		if (weekDeleteIds.length) {
			document.querySelectorAll('.js-existing-week-item').forEach((week, index) => {
				if (!week.classList.contains('set-to-delete')) {
					weekIds.push({
						_id: week.getAttribute('id'), 
						termId: week.dataset['termId'], 
						termOrder: week.dataset['termOrder']
					})
				} else {
					termIdsWithWeekUpdates.push(week.dataset['termId'])
				}
			});
		}


		// Week Updates
		let weekUpdateProperties = []
		if (weekDeleteIds.length) {
			_.uniq(_.pullAll(termIdsWithWeekUpdates, termDeleteIds)).forEach((termId) => {
				let termWeeks = _.filter(weekIds, ['termId', termId])
				termWeeks.forEach((week, index) => {
					let newOrder = index + 1;
					weekUpdateProperties.push({_id: week._id, order: parseInt(newOrder), termOrder: week.termOrder, termId: week.termId})
				});
			})
		}


		/* -------------------- Inserts -------------------- */
		// Term Inserts
		let termInsertProperties = [];
		let termCount = $('.js-term-item').not('.set-to-delete').length
		$('.js-weeks-per-term').each(function(index, weeks) {
			if (weeks.value) {
				termInsertProperties.push({
					order: termCount + index + 1,
					weeksPerTerm: parseInt(weeks.value),
				})
			}
		});


		// New Week Ids
		let newWeekIds = []
		document.querySelectorAll('.js-new-week-item').forEach((week, index) => {
			if (!week.classList.contains('set-to-delete')) {
				newWeekIds.push({
					termOrder: week.dataset['termOrder'],
					termId: week.dataset['termId'],
				})
			}
		});


		// Week Inserts
		let weekInsertProperties = [];
		termIds.forEach((termId) => {
			let termNewWeeks = _.filter(newWeekIds, ['termId', termId]);
			termNewWeeks.forEach((week, index) => {
				let weekListId = $('#' + termId).attr('data-term-index');
				let weekCount = $('#' + weekListId + ' .js-existing-week-item').not('.set-to-delete').length
				week.order = weekCount + index + 1
				weekInsertProperties.push(week)
			})
		});


		// Path Properties
		let pathProperties = {
			studentIds: [],
			schoolYearIds: [FlowRouter.getParam('selectedSchoolYearId')],
			termIds: [],
		}

		if (termDeleteIds.length || weekDeleteIds.length || termUpdateProperties.length || weekUpdateProperties.length || termInsertProperties.length || weekInsertProperties.length) {
			Meteor.call('updateSchoolYearTerms', FlowRouter.getParam('selectedSchoolYearId'), schoolYearProperties, termDeleteIds, weekDeleteIds, termUpdateProperties, weekUpdateProperties, termInsertProperties, weekInsertProperties, Meteor.userId(), Meteor.user().info.groupId, function(error) {
				if (error) {
					Alerts.insert({
						colorClass: 'bg-danger',
						iconClass: 'icn-danger',
						message: error.reason,
					});
					
					$('.js-updating').hide();
					$('.js-submit').prop('disabled', false);
				} else {
					Meteor.call('runPrimaryInitialIds');
					Meteor.call('runUpsertPaths', pathProperties, true, function(error, result) {

						Session.set('selectedSchoolYearId', result.schoolYearId);
						Session.set('selectedTermId', result.termId);
						Session.set('selectedWeekId', result.weekId);

						$('.js-updating').hide();
						$('.js-submit').prop('disabled', false);
						FlowRouter.go('/planning/schoolyears/view/3/' + FlowRouter.getParam('selectedSchoolYearId'));
					});
				}
			});
		} else {
			Meteor.call('updateSchoolYear', FlowRouter.getParam('selectedSchoolYearId'), schoolYearProperties, function(error) {
				if (error) {
					Alerts.insert({
						colorClass: 'bg-danger',
						iconClass: 'icn-danger',
						message: error.reason,
					});
					
					$('.js-updating').hide();
					$('.js-submit').prop('disabled', false);
				} else {
					Meteor.call('runPrimaryInitialIds');
					Meteor.call('runUpsertPaths', pathProperties, true, function(error, result) {

						Session.set('selectedSchoolYearId', result.schoolYearId);
						Session.set('selectedTermId', result.termId);
						Session.set('selectedWeekId', result.weekId);

						$('.js-updating').hide();
						$('.js-submit').prop('disabled', false);
						FlowRouter.go('/planning/schoolyears/view/3/' + FlowRouter.getParam('selectedSchoolYearId'));
					});
				}
			});
		}

		return false
	},

	'click .js-cancel'(event) {
		event.preventDefault();

		if (window.screen.availWidth > 768) {
			FlowRouter.go('/planning/schoolyears/view/3/' + FlowRouter.getParam('selectedSchoolYearId'))
		} else {
			FlowRouter.go('/planning/schoolyears/view/2/' + FlowRouter.getParam('selectedSchoolYearId'))
		}
	},
});









