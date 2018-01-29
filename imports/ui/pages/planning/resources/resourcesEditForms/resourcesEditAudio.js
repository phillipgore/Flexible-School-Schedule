import {Template} from 'meteor/templating';
import { Resources } from '../../../../../api/resources/resources.js';
import './resourcesEditAudio.html';

Template.resourcesEditAudio.onCreated( function() {
	// Subscriptions
	this.subscribe('resource', FlowRouter.getParam('id'));
});

Template.resourcesEditAudio.onRendered( function() {
	// Toolbar Settings
	Session.set({
		leftUrl: '',
		leftIcon: '',
		label: 'Edit Audio Resource',
		rightUrl: '',
		rightIcon: '',
	});

	// Navbar Settings
	Session.set('activeNav', 'planningList');

	// Form Validation and Submission
	$('.js-form-resources-audio-edit').validate({
		rules: {
			title: { required: true },
			link: { url: true },
			publicationDate: { date: true },
		},
		messages: {
			title: { required: "Required." },
			link: { url: "Please enter a valid url. ex: http://www.amazon.com" },
			publicationDate: { date: "Please enter a valid date." },
		},		

		submitHandler() {
			const resourceProperties = {
				type: 'audio',
				searchIndex: ['Music', 'MP3Downloads'],
				title: event.target.title.value.trim(),
				artist: event.target.artist.value.trim(),
				availability: event.target.availability.value.trim(),
				link: event.target.link.value.trim(),
				description: event.target.description.value.trim(),
			};

			Meteor.call('updateResource', FlowRouter.getParam('id'), resourceProperties, function(error) {
				if (error) {
					Alerts.insert({
						colorClass: 'bg-danger',
						iconClass: 'fss-danger',
						message: error.reason,
					});
				} else {
					FlowRouter.go('/planning/resources/view/' + FlowRouter.getParam('id'));
				}
			});

			return false;
		}
	});
});

Template.resourcesEditAudio.helpers({
	resource: function() {
		return Resources.findOne();
	},

	availability: function(currentAvailability, availability) {
		if (currentAvailability === availability) {
			return true;
		}
		return false;
	},
});

Template.resourcesEditAudio.events({
	'submit .js-form-resources-audio-edit'(event) {
		event.preventDefault();
	},
});