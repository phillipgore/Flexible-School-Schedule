import {Template} from 'meteor/templating';
import { Subjects } from '../../../../api/subjects/subjects.js';
import { Students } from '../../../../api/students/students.js';
import { Resources } from '../../../../api/resources/resources.js';
import { SchoolYears } from '../../../../api/schoolYears/schoolYears.js';
import { Terms } from '../../../../api/terms/terms.js';
import { Weeks } from '../../../../api/weeks/weeks.js';
import { Lessons } from '../../../../api/lessons/lessons.js';
import './subjectsEdit.html';

LocalResources = new Mongo.Collection(null);

Template.subjectsEdit.onCreated( function() {
	// Subscriptions
	this.subscribe('subject', FlowRouter.getParam('id'), function() {
		Session.set('schoolYearId', Subjects.findOne().schoolYearId)
	});
	this.subscribe('allStudents');
	this.subscribe('allSchoolYears');
	this.subscribe('allTerms');
	this.subscribe('allWeeks');
	this.subscribe('subjectLessons', FlowRouter.getParam('id'));

	let template = Template.instance();

	template.subjectId = new ReactiveVar(FlowRouter.getParam('id'))
	template.searchQuery = new ReactiveVar();
	template.searching   = new ReactiveVar( false );

	template.autorun( () => {
		template.subscribe('subjectResources', template.subjectId.get(), () => {
	    	LocalResources.remove({});
			Resources.find().forEach(function(resource) {
				LocalResources.insert({id: resource._id, type: resource.type, title: resource.title});
			});
			template.subjectId.set('');
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

Template.subjectsEdit.onRendered( function() {
	// Toolbar Settings
	Session.set({
		leftUrl: '',
		leftIcon: '',
		label: 'Edit Subject',
		rightUrl: '',
		rightIcon: '',
	});

	// Navbar Settings
	Session.set('activeNav', 'planningList');

	// Form Validation and Submission
	$('.js-form-subjects-update').validate({
		rules: {
			name: { required: true },
			schoolYearId: { required: true },
			timesPerWeek: { number: true },
		},
		messages: {
			name: { required: "Required." },
			schoolYearId: { required: "Required." },
			timesPerWeek: { number: "" },
		},
		errorPlacement: function(error, element) {
			var placement = $(element).data('error');
			if (placement) {
				$(element).parent().addClass('error');
				$(placement).append(error)
			} else {
				error.insertAfter(element);
			}
		},

		submitHandler() {
			let resourceIds = []
			LocalResources.find().forEach(function(resource) {
				resourceIds.push(resource.id);
			});

			const subjectProperties = {
				name: event.target.name.value.trim(),
				description: event.target.description.value.trim(),
				resources: resourceIds,
				studentId: event.target.studentId.value.trim(),
				schoolYearId: event.target.schoolYearId.value.trim(),
			}

			let newLessonProperties = []
			event.target.timesPerWeek.forEach(function(times, index) {
				for (i = 0; i < parseInt(times.value); i++) { 
				    newLessonProperties.push({order: parseFloat((index + 1) + '.' + (i + 1)), weekId: times.dataset.weekId});
				}
			});

			let lessons = Lessons.find();
			if (lessons.count() > newLessonProperties.length) {
				let dif = lessons.count() - newLessonProperties.length;
				let removeLessons = Lessons.find({
					$and: [{
						completedOn: null,
					    completionTime: null,
					    description: null,
					}]
				}, {sort: {order: -1}, limit: dif});

				var removeLessonIds = removeLessons.map(lesson => (lesson._id));

				if (dif > removeLessonIds.length) {
					let overLessons = removeLessonIds.length - dif;
					Alerts.insert({
						colorClass: 'bg-danger',
							iconClass: 'fss-danger',
							message: "These changes would delete lessons you have already worked on. Add at least " + overLessons + " lessons to the subject.",
					});
					return false;
				}

				let currentLessonProperties = Lessons.find({_id: {$nin: removeLessonIds}})
				var updateLessonProperties = []
				currentLessonProperties.forEach(function(property, index) {
					property.order = newLessonProperties[index].order;
					property.weekId = newLessonProperties[index].weekId;
					updateLessonProperties.push(property)
				});

				// console.log('remove: ' + removeLessonIds)
				// console.log('update: ' + updateLessonProperties)

			} else if (lessons.count() < newLessonProperties.length) {
				// console.log(newLessonProperties)
				let dif = newLessonProperties.length - lessons.count();

				let currentLessonProperties = Lessons.find().fetch();
				for (i = 0; i < dif; i++) { 
				    currentLessonProperties.push({order: parseFloat((i + lessons.count()) + '.' + (i + 1)), weekId: null});
				}
				// console.log(currentLessonProperties)

				let subjectId = FlowRouter.getParam('id');
				let allLessonProperties = []
				currentLessonProperties.forEach(function(property, index) {
					property.order = newLessonProperties[index].order;
					property.weekId = newLessonProperties[index].weekId;
					property.subjectId = subjectId;
					allLessonProperties.push(property);
				});

				let startSlice = lessons.count();
				let endSlice = 0 - dif;

				var updateLessonProperties = allLessonProperties.slice(0, startSlice);
				var insertLessonProperties = allLessonProperties.slice(endSlice);

				// console.log('update: ' + updateLessonProperties)
				// console.log('insert: ' + insertLessonProperties)

			} else {
				let currentLessonProperties = Lessons.find()
				var updateLessonProperties = []
				currentLessonProperties.forEach(function(property, index) {
					property.order = newLessonProperties[index].order;
					property.weekId = newLessonProperties[index].weekId;
					updateLessonProperties.push(property)
				});

				// console.log('update: ' + updateLessonProperties)

			}

			console.log(updateLessonProperties);
			console.log(insertLessonProperties);
			console.log(removeLessonIds);

			Meteor.call('updateSubject', FlowRouter.getParam('id'), subjectProperties, function(error, subjectId) {
				if (error) {
					Alerts.insert({
						colorClass: 'bg-danger',
						iconClass: 'fss-danger',
						message: error.reason,
					});
				} else {
					if (insertLessonProperties) {
						Meteor.call('batchInsertLessons', insertLessonProperties, function(error) {
							if (error) {
								Alerts.insert({
									colorClass: 'bg-danger',
									iconClass: 'fss-danger',
									message: error.reason,
								});
							}
						});
					}

					if (removeLessonIds) {
						Meteor.call('batchRemoveLessons', removeLessonIds, function(error) {
							if (error) {
								Alerts.insert({
									colorClass: 'bg-danger',
									iconClass: 'fss-danger',
									message: error.reason,
								});
							}
						});
					}

					Meteor.call('batchUpdateLessons', updateLessonProperties, function(error) {
						if (error) {
							Alerts.insert({
								colorClass: 'bg-danger',
								iconClass: 'fss-danger',
								message: error.reason,
							});
						} else {
							FlowRouter.go('/planning/subjects/view/' + subjectId);
						}
					});
				}
			});

			return false;
		}
	});
})

Template.subjectsEdit.helpers({
	subject: function() {
		return Subjects.findOne();
	},

	students: function() {
		return Students.find({}, {sort: {birthday: 1, lastName: 1, firstName: 1}});
	},

	studentSelected: function(currentStudent, student) {
		if (currentStudent == student) {
			return true;
		}
		return false;
	},

	schoolYears: function() {
		return SchoolYears.find({}, {sort: {startYear: 1}});
	},

	schoolYearSelected: function(currentSchoolYear, schoolYear) {
		if (currentSchoolYear == schoolYear) {
			return true;
		}
		return false;
	},

	terms: function() {
		return Terms.find({schoolYearId: Session.get('schoolYearId')}, {sort: {order: 1}});
	},

	weeks: function(termId) {
        return Weeks.find({termId: termId});
	},

	lessonCount: function(weekId) {
        return Lessons.find({weekId: weekId}).count();
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

	cancelPath: function() {
		return '/planning/subjects/view/' + FlowRouter.getParam('id');
	},
});

Template.subjectsEdit.events({
	'change .js-school-year-id'(event) {
		Session.set({schoolYearId: event.currentTarget.value})
	},

	'change .js-times-per-week-preset'(event) {
		$('#' + event.currentTarget.dataset.termId).find('.js-times-per-week').val(event.currentTarget.value);
	},

	'change .js-times-per-week'(event) {
		$('#' + event.currentTarget.dataset.termId + ' .js-times-per-week-preset option').removeProp('selected');
		$('#' + event.currentTarget.dataset.termId + ' .js-times-per-week-preset option:disabled').prop('selected', true);
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
				iconClass: 'fss-warning',
				message: localResource.title + ' is already attached to this subject.',
			});
		} else {
			LocalResources.insert({id: resource._id, type: resource.type, title: resource.title});

			Alerts.remove({type: 'addResource'});
			$('#search-resources').val('');
			template.searchQuery.set('');
			template.searching.set(false);
		}
	},

	'click .js-remove-resource'(event) {
		event.preventDefault();

		Alerts.remove({type: 'addResource'});
		LocalResources.remove({id: event.currentTarget.id});
	},

	'submit .js-form-subjects-update'(event) {
		event.preventDefault();
	},
});








