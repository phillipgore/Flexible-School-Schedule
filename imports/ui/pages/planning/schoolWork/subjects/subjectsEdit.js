import {Template} from 'meteor/templating';
import { Subjects } from '../../../../../api/subjects/subjects.js';

import {requiredValidation} from '../../../../../modules/functions';
import './subjectsEdit.html';

Template.subjectsEdit.onCreated( function() {	
	let template = Template.instance();
	
	this.subjectData = Meteor.subscribe('subject', FlowRouter.getParam('selectedSubjectId'));
});

Template.subjectsEdit.onRendered( function() {
	Session.set({
		toolbarType: 'edit',
		labelThree: 'Edit Subject',
		activeNav: 'planningList',
	});
});


Template.subjectsEdit.helpers({
	subject: function() {
		return Subjects.findOne({_id: FlowRouter.getParam('selectedSubjectId')});
	},
});

Template.subjectsEdit.events({
	'submit .js-form-subjects-update'(event, template) {
		event.preventDefault();

		if ( !requiredValidation($("[name='name']").val().trim()) ) {
			$('#name').addClass('error');
			$('.name-errors').text('Required.');
		} else {
			$('.js-updating').show();
			$('.js-submit').prop('disabled', true);

			$('#name').removeClass('error');
			$('.name-errors').text('');

			$('.js-saving').show();
			$('.js-submit').prop('disabled', true);

			let studentIds = []
			$("[name='studentId']:checked").each(function() {
				studentIds.push(this.id)
			})

			const subjectProperties = {
				_id: FlowRouter.getParam('selectedSubjectId'),
				name: template.find("[name='name']").value.trim(),
				studentId: FlowRouter.getParam('selectedStudentId'),
				schoolYearId: FlowRouter.getParam('selectedSchoolYearId'),
			};

			let pathProperties = {
				studentIds: [FlowRouter.getParam('selectedStudentId')],
				schoolYearIds: [FlowRouter.getParam('selectedSchoolYearId')],
				termIds: [],
			}

			Meteor.call('updateSubject', subjectProperties, function(error, result) {
				if (error) {
					Alerts.insert({
						colorClass: 'bg-danger',
						iconClass: 'icn-danger',
						message: error.message,
					});
					
					$('.js-updating').hide();
					$('.js-submit').prop('disabled', false);
				} else {
					Meteor.call('runUpsertSchoolWorkPaths', pathProperties, function(error, result) {
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
							FlowRouter.go('/planning/subjects/view/3/' + FlowRouter.getParam('selectedStudentId') +'/'+ FlowRouter.getParam('selectedSchoolYearId') +'/'+ FlowRouter.getParam('selectedSubjectId'));
						}
					});
				}
			});
		}
	},

	'click .js-cancel'(event) {
		event.preventDefault();

		if (window.screen.availWidth > 768) {
			FlowRouter.go('/planning/subjects/view/3/' + FlowRouter.getParam('selectedStudentId') +'/'+ FlowRouter.getParam('selectedSchoolYearId') +'/'+ FlowRouter.getParam('selectedSubjectId'));
		} else {
			FlowRouter.go('/planning/subjects/view/2/' + FlowRouter.getParam('selectedStudentId') +'/'+ FlowRouter.getParam('selectedSchoolYearId') +'/'+ FlowRouter.getParam('selectedSubjectId'));
		}
	},
});