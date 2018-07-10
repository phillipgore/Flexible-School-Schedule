import {Template} from 'meteor/templating';
import { Resources } from '../../../../../api/resources/resources.js';

import autosize from 'autosize';
import './resourcesEditApp.html';

Template.resourcesEditApp.onCreated( function() {
	this.subscribe('resource', FlowRouter.getParam('selectedResourceId'));
});

Template.resourcesEditApp.onRendered( function() {
	// Toolbar Settings
	Session.set({
		toolbarType: 'edit',
		labelThree: 'Edit App Resource',
		
		
		activeNav: 'planningList',
	});

	// Textarea Autoresize
	autosize($('#description'));

	// Form Validation and Submission
	$('.js-form-resources-app-edit').validate({
		rules: {
			title: { required: true },
			link: { url: true },
		},
		messages: {
			title: { required: "Required." },
			link: { url: "Please enter a valid url. ex: http://www.amazon.com" },
		},		

		submitHandler() {
			$('.js-updating').show();
			$('.js-submit').prop('disabled', true);

			const resourceProperties = {
				type: 'app',
				searchIndex: ['Software', 'MobileApps'],
				title: event.target.title.value.trim(),
				availability: event.target.availability.value.trim(),
				link: event.target.link.value.trim(),
				description: event.target.description.value.trim(),
			};

			Meteor.call('updateResource', FlowRouter.getParam('selectedResourceId'), resourceProperties, function(error) {
				if (error) {
					Alerts.insert({
						colorClass: 'bg-danger',
						iconClass: 'fss-danger',
						message: error.reason,
					});
					
					$('.js-updating').hide();
					$('.js-submit').prop('disabled', false);
				} else {
					FlowRouter.go('/planning/resources/view/3/' + FlowRouter.getParam('selectedResourceType') +'/'+ FlowRouter.getParam('selectedResourceAvailability') +'/'+ FlowRouter.getParam('selectedResourceId') +'/'+ FlowRouter.getParam('selectedResourceCurrentTypeId'));
				}
			});

			return false;
		}
	});
});

Template.resourcesEditApp.helpers({
	resource: function() {
		return Resources.findOne({_id: FlowRouter.getParam('selectedResourceId')});
	},

	availability: function(currentAvailability, availability) {
		if (currentAvailability === availability) {
			return true;
		}
		return false;
	},

	cancelPath: function() {
		return '/planning/resources/view/3/' + FlowRouter.getParam('selectedResourceType') +'/'+ FlowRouter.getParam('selectedResourceAvailability') +'/'+ FlowRouter.getParam('selectedResourceId') +'/'+ FlowRouter.getParam('selectedResourceCurrentTypeId');
	},
});

Template.resourcesEditApp.events({
	'submit .js-form-resources-app-edit'(event) {
		event.preventDefault();
	},
});