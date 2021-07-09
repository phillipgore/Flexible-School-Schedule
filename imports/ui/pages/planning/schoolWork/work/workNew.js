import {Template} from 'meteor/templating';
import { Resources } from '../../../../../api/resources/resources.js';
import { SchoolYears } from '../../../../../api/schoolYears/schoolYears.js';
import { Subjects } from '../../../../../api/subjects/subjects.js';
import { Terms } from '../../../../../api/terms/terms.js';
import { Weeks } from '../../../../../api/weeks/weeks.js';

import {requiredValidation} from '../../../../../modules/functions';
import YTPlayer from 'yt-player';
import _ from 'lodash'
import './workNew.html';

LocalResources = new Mongo.Collection(null);

Template.workNew.onCreated( function() {	
	Session.setPersistent('unScrolled', true);
	
	// Subscriptions
	this.subjectData = this.subscribe('schooYearStudentSubject', FlowRouter.getParam('selectedSchoolYearId'), FlowRouter.getParam('selectedStudentId'));
	this.schoolYearData = this.subscribe('schoolYear', FlowRouter.getParam('selectedSchoolYearId'));
	this.termData = this.subscribe('schoolYearTerms', FlowRouter.getParam('selectedSchoolYearId'));
	this.weekData = this.subscribe('schoolYearWeeks', FlowRouter.getParam('selectedSchoolYearId'));

	let template = Template.instance();

	template.searchQuery = new ReactiveVar();
	template.searching   = new ReactiveVar( false );
	template.timesPerWeek = new ReactiveVar();

	template.autorun( () => {
		template.subscribe( 'searchResources', template.searchQuery.get(), () => {
		  setTimeout( () => {
		    template.searching.set( false );
		  }, 500 );
		});
	});
});

Template.workNew.onRendered( function() {
	let template = Template.instance();

	if (window.screen.availWidth > 640) {
		document.getElementsByClassName('frame-two')[0].scrollTop = 0;
	}

	const playerOne = new YTPlayer('#playerOne');
	const playerTwo = new YTPlayer('#playerTwo');
	const playerThree = new YTPlayer('#playerThree');
	const playerFour = new YTPlayer('#playerFour');

	playerOne.load('RSExIsxSNdI');
	playerTwo.load('AYiOWFlbNgc');
	playerThree.load('hZX716AS2_4');
	playerFour.load('YZzeUAZ64AU');

	// Resources Input Settings
	LocalResources.remove({});

	// School Year Id Settings
	Session.set({schoolYearId: ''})

	Session.set({
		toolbarType: 'new',
		labelThree: 'New School Work',
		activeNav: 'planningList',
	});
});

Template.workNew.helpers({
	subscriptionReady: function() {
		if (Template.instance().subjectData.ready() && Template.instance().schoolYearData.ready() && Template.instance().termData.ready() && Template.instance().weekData.ready()) {
			return true;
		}
	},

	selectedSchoolYear: function() {
		return SchoolYears.findOne({_id: FlowRouter.getParam('selectedSchoolYearId')});
	},

	subjects: function() {
		return Subjects.find({}, {sort: {name: 1}});
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

	isChecked: function(studentId) {
		if (studentId === Session.get('selectedStudentId')) {
			return true;
		}
		return false;
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

	uniqeTimesPerWeek: function() {
		return Template.instance().timesPerWeek.get();
	},

	isSeven: function(times) {
		if (times === 7) {
			return true;
		}
		return false;
	},

	isZero: function(times) {
		if (times === 0) {
			return true;
		}
		return false;
	}
});

Template.workNew.events({
	'change .js-times-per-week-preset'(event) {
		$('#' + event.currentTarget.dataset.termId).find('.js-times-per-week').val(event.currentTarget.value);
	},

	'keypress .js-times-per-week'(event) {
		let allowedKeys = [49, 50, 51, 52, 53, 54, 55, 56, 57];
		let keyCode = event.which || event.keyCode;
		
		if (allowedKeys.indexOf(keyCode) < 0) {
			event.preventDefault();
		}
	},

	'keyup .js-times-per-week'(event) {
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

	'change .js-times-per-week-preset, keyup .js-times-per-week'(event, template) {
		event.preventDefault();
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

		template.timesPerWeek.set(_.uniq(timesPerWeek).sort());
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
				message: '"' + localResource.title + ' is already attached to this schoolWork.',
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

	'click .js-step-circle, click .js-step-btn'(event) {
		event.preventDefault();

		let template = Template.instance();
		let stepClass = $(event.currentTarget).attr('data-id');

		if (stepClass === 'js-step-one') {
			$('.js-step-circle').removeClass('bg-info');
			$('.js-circle-one').addClass('bg-info');

			$('.js-step').hide();
			$('.' + stepClass).show();
		}
		if (stepClass === 'js-step-two') {
			if ( requiredValidation($("[name='name']").val().trim()) ) {
				$('#name').removeClass('error');
				$('.name-errors').text('');

				$('.js-step-circle').removeClass('bg-info');
				$('.js-circle-two').addClass('bg-info');

				$('.js-step').hide();
				$('.' + stepClass).show();
			} else {
				$('#name').addClass('error');
				$('.name-errors').text('Required.');
			}
		}
		if (stepClass === 'js-step-three') {
			if ( requiredValidation($("[name='name']").val().trim()) ) {
				$('#name').removeClass('error');
				$('.name-errors').text('');

				$('.js-step-circle').removeClass('bg-info');
				$('.js-circle-three').addClass('bg-info');

				$('.js-step').hide();
				$('.' + stepClass).show();
			} else {
				$('#name').addClass('error');
				$('.name-errors').text('Required.');
			}
		}
		if (stepClass === 'js-step-four') {
			if ( requiredValidation($("[name='name']").val().trim()) ) {
				$('#name').removeClass('error');
				$('.name-errors').text('');

				$('.js-step-circle').removeClass('bg-info');
				$('.js-circle-four').addClass('bg-info');

				$('.js-step').hide();
				$('.' + stepClass).show();
			} else {
				$('#name').addClass('error');
				$('.name-errors').text('Required.');
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

	'submit .js-form-school-work-new'(event, template) {
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
			$('.js-saving').show();
			$('.js-submit').prop('disabled', true);

			let resourceIds = [];
			LocalResources.find().forEach(function(resource) {
				resourceIds.push(resource.id);
			});

			let scheduledDays = [];
			$('.js-day-labels-section').each(function() {
				let segmentCount = parseInt($(this).attr('data-segment-count'))
				if (segmentCount) {
					let days = []
					$(this).find("[name='scheduledDays']:checked").each(function() {
						days.push(parseInt($(this).val()))
					});
					scheduledDays.push({'segmentCount': segmentCount, 'days': days})
				}
			});

			let studentId = FlowRouter.getParam('selectedStudentId');
			let schoolYearId = FlowRouter.getParam('selectedSchoolYearId');
			let subjectId = template.find("[name='subjectId']").value.trim();
			Session.set('selectedSubjectId', subjectId);

			const schoolWorkProperties = {
				type: 'work',
				name: template.find("[name='name']").value.trim(),
				description: $('.js-form-school-work-new .editor-content').html(),
				resources: resourceIds,
				studentId: studentId,
				schoolYearId: schoolYearId,
				subjectId: subjectId === 'noSubject' ? undefined : subjectId,
				scheduledDays: scheduledDays,
			};
			
			let lessonProperties = [];
			let weekIds = [];
			$("[name='timesPerWeek']").each(function(index) {
				let weekDayLabels = scheduledDays.find(dayLabel => dayLabel.segmentCount == this.value);
				for (i = 0; i < parseInt(this.value); i++) {
				    lessonProperties.push({
						order: i + 1,
						studentId: studentId,
				    	schoolYearId: schoolYearId, 
				    	termId: this.dataset.termId,
				    	termOrder: parseInt(this.dataset.termOrder), 
				    	weekId: this.dataset.weekId,
				    	weekOrder: parseInt(this.dataset.weekOrder),
				    	weekDay: parseInt(weekDayLabels.days[i]),
						subjectId: subjectId === 'noSubject' ? undefined : subjectId,
					});
				    weekIds.push(this.dataset.weekId)
				}
			});

			let pathProperties = {
				studentIds: [studentId],
				schoolYearIds: [schoolYearId],
				termIds: Array.from(document.getElementsByClassName('js-term-container')).map(term => term.id),
			};

			let statProperties = {
				studentIds: [studentId],
				schoolYearIds: [schoolYearId],
				termIds: Array.from(document.getElementsByClassName('js-term-container')).map(term => term.id),
				weekIds: _.uniq(weekIds),
			}
			
			Meteor.call('insertSchoolWork', schoolWorkProperties, lessonProperties, function(error, schoolWorkId) {
				if (error) {
					Alerts.insert({
						colorClass: 'bg-danger',
						iconClass: 'icn-danger',
						message: error.reason,
					});
					
					$('.js-saving').hide();
					$('.js-submit').prop('disabled', false);
				} else {
					Meteor.call('runUpsertSchoolWorkPathsAndStats', pathProperties, statProperties, function(error) {
						if (error) {
							Alerts.insert({
								colorClass: 'bg-danger',
								iconClass: 'icn-danger',
								message: error.reason,
							});
							
							$('.js-saving').hide();
							$('.js-submit').prop('disabled', false);
						} else {
							Session.set('selectedSchoolWorkId', schoolWorkId);
							Session.set('selectedSchoolWorkType', 'work');
							
							FlowRouter.go('/planning/work/view/3/' + Session.get('selectedStudentId') +'/'+ Session.get('selectedSchoolYearId') +'/'+ schoolWorkId);
						}
					});
				}
			});

			return false;
		}
	},

	'click .js-cancel'(event) {
		event.preventDefault();

		if (window.screen.availWidth > 768) {
			FlowRouter.go('/planning/' + Session.get('selectedSchoolWorkType') + '/view/3/' + Session.get('selectedStudentId') +'/'+ Session.get('selectedSchoolYearId') +'/'+ Session.get('selectedSchoolWorkId'))
		} else {
			FlowRouter.go('/planning/' + Session.get('selectedSchoolWorkType') + '/view/2/' + Session.get('selectedStudentId') +'/'+ Session.get('selectedSchoolYearId') +'/'+ Session.get('selectedSchoolWorkId'))
		}
		
	},
});









