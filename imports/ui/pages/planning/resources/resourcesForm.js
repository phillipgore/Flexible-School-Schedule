import {Template} from 'meteor/templating';
import { Resources } from '../../../../api/resources/resources.js';

import moment from 'moment';
import _ from 'lodash';
import './resourcesForm.html';


Template.resourcesForm.onCreated( function() {
	if (FlowRouter.getParam('selectedResourceId')) {
		this.subscribe('resource', FlowRouter.getParam('selectedResourceId'));
	};

	Session.set('selectedResourceNewType', FlowRouter.getParam('selectedResourceNewType'));
	if (FlowRouter.getRouteName() === 'resourcesNew') {
		Session.setPersistent('unScrolled', true);
	}
});

Template.resourcesForm.onRendered( function() {
	if (window.screen.availWidth > 640 && FlowRouter.getRouteName() === 'resourcesNew') {
		document.getElementsByClassName('frame-two')[0].scrollTop = 0;
	}

	
	let template = Template.instance();
		
	if (FlowRouter.getRouteName() === 'resourcesNew' || FlowRouter.getRouteName() === 'workNew' || FlowRouter.getRouteName() === 'workEdit') {
		Session.set({
			toolbarType: 'new',
			labelThree: 'New ' + _.capitalize(FlowRouter.getParam('selectedResourceNewType')) + ' Resource',
			activeNav: 'planningList',
			currentType: Session.get('selectedResourceNewType'),
		});
	}

	if (FlowRouter.getRouteName() === 'resourcesEdit') {
		Session.set({
			toolbarType: 'edit',
			labelThree: 'Edit ' + _.capitalize(FlowRouter.getParam('selectedResourceCurrentTypeId')) + ' Resource',
			activeNav: 'planningList',
			currentType: FlowRouter.getParam('selectedResourceCurrentTypeId'),
		});		
	}

	// Form Validation and Submission
	$('.js-form-new-resource').validate({
		rules: {
			title: { required: true },
			link: { url: true },
			// publicationDate: { date: true },
			publicationYear: { number: true },
		},
		messages: {
			title: { required: "Required." },
			link: { url: "Please enter a valid url. ex: http://www.amazon.com" },
			// publicationDate: { date: "Please enter a valid date." },
			publicationYear: { date: "Please enter a valid year." },
		},		

		submitHandler() {
			$('.resource-loading .js-saving').show();
			$('.js-submit').prop('disabled', true);

			const resourceProperties = {
				title: template.find("[name='title']").value.trim(),
				link: template.find("[name='link']").value.trim(),
				description: $('#' + $('.js-form-new-resource').find('.editor-content').attr('id')).html(),
			};

			if (Session.get('currentType') === 'book') {
				resourceProperties.type = 'book';
				resourceProperties.searchIndex = ['Books', 'KindleStore'];
				resourceProperties.authorFirstName = template.find("[name='authorFirstName']").value.trim();
				resourceProperties.authorLastName = template.find("[name='authorLastName']").value.trim();
				resourceProperties.availability = template.find("[name='availability']:checked").value.trim();
				resourceProperties.publisher = template.find("[name='publisher']").value.trim();
				// resourceProperties.publicationDate = template.find("[name='publicationDate']").value.trim();
				resourceProperties.publicationYear = Number(template.find("[name='publicationYear']").value.trim());
			}

			if (resourceProperties.publicationYear === 0) {
				resourceProperties.publicationYear = undefined;
			}

			// if (_.has(resourceProperties, 'publicationDate')) {
			// 	resourceProperties.publicationDate = moment(resourceProperties.publicationDate).toISOString();
			// }

			if (Session.get('currentType') === 'link') {
				resourceProperties.type = 'link';
				resourceProperties.searchIndex = [];
				resourceProperties.availability = 'own';
			}

			if (Session.get('currentType') === 'video') {
				resourceProperties.type = 'video';
				resourceProperties.searchIndex = ['Movies', 'UnboxVideo'];
				resourceProperties.directorFirstName = template.find("[name='directorFirstName']").value.trim();
				resourceProperties.directorLastName = template.find("[name='directorLastName']").value.trim();
				resourceProperties.availability = template.find("[name='availability']:checked").value.trim();
			}

			if (Session.get('currentType') === 'audio') {
				resourceProperties.type = 'audio';
				resourceProperties.searchIndex = ['Music', 'MP3Downloads'];
				resourceProperties.artistFirstName = template.find("[name='artistFirstName']").value.trim();
				resourceProperties.artistLastName = template.find("[name='artistLastName']").value.trim();
				resourceProperties.availability = template.find("[name='availability']:checked").value.trim();
			}
			
			if (Session.get('currentType') === 'app') {
				resourceProperties.type = 'app';
				resourceProperties.searchIndex = ['Software', 'MobileApps'];
				resourceProperties.availability = template.find("[name='availability']:checked").value.trim();
			}

			if (FlowRouter.getRouteName() === 'resourcesNew' || FlowRouter.getRouteName() === 'workNew' || FlowRouter.getRouteName() === 'workEdit') {
				Meteor.call('insertResource', resourceProperties, function(error, resourceId) {
					if (error) {
						Alerts.insert({
							colorClass: 'bg-danger',
							iconClass: 'icn-danger',
							message: error.reason,
						});
						
						$('.resource-loading .js-saving').hide();
						$('.js-submit').prop('disabled', false);
					} else {
						Session.set('selectedResourceId', resourceId);
						if (FlowRouter.getRouteName() === 'resourcesNew') {
							FlowRouter.go('/planning/resources/view/3/all/all/' + resourceId +'/' + Session.get('currentType'));
						}
						if (FlowRouter.getRouteName() === 'workNew' || FlowRouter.getRouteName() === 'workEdit') {
							LocalResources.insert({id: resourceId, type: resourceProperties.type, title: resourceProperties.title});
							document.getElementsByClassName('js-form-new-resource')[0].reset();
							document.getElementsByClassName('js-form-new-resource')[0].getElementsByClassName('editor-content')[0].innerHTML = '';
							if (Session.get('currentType') != 'link') {
								document.getElementsByClassName('js-form-new-resource')[0].getElementsByClassName('js-radio-own')[0].checked = true;
							}
							document.getElementsByClassName('popover-content')[0].scrollTop = 0;
							$('.resource-loading .js-saving').hide();
							$('.js-submit').prop('disabled', false);
							document.getElementsByClassName('js-resource-popover')[0].classList.add('hide');
						}
					}
				});
			}

			if (FlowRouter.getRouteName() === 'resourcesEdit') {
				Meteor.call('updateResource', FlowRouter.getParam('selectedResourceId'), resourceProperties, function(error) {
					if (error) {
						Alerts.insert({
							colorClass: 'bg-danger',
							iconClass: 'icn-danger',
							message: error.reason,
						});
						
						$('.resource-loading .js-updating').hide();
						$('.js-submit').prop('disabled', false);
					} else {
						FlowRouter.go('/planning/resources/view/3/' + FlowRouter.getParam('selectedResourceType') +'/'+ FlowRouter.getParam('selectedResourceAvailability') +'/'+ FlowRouter.getParam('selectedResourceId') +'/'+ FlowRouter.getParam('selectedResourceCurrentTypeId'));
					}
				});
			}

			return false;
		}
	});

});

Template.resourcesForm.helpers({
	isNewResource: function() {
		if (FlowRouter.getRouteName() === 'resourcesNew' || FlowRouter.getRouteName() === 'workNew' || FlowRouter.getRouteName() === 'workEdit') {
			return true;
		}
		return false;
	},

	resource: function() {
		if (FlowRouter.getRouteName() === 'resourcesEdit') {
			return Resources.findOne({_id: FlowRouter.getParam('selectedResourceId')});
		}
		return false;
	},

	checkAvailability: function(currentAvailability, availability) {
		if (currentAvailability === availability) {
			return true;
		}
		if (availability === 'own' && FlowRouter.getRouteName() === 'resourcesNew') {
			return true;
		}
		if (availability === 'own' && FlowRouter.getRouteName() === 'workNew' || availability === 'own' && FlowRouter.getRouteName() === 'workEdit') {
			return true;
		}
		return false;
	},

	resourceFormType: function() {
		if (FlowRouter.getRouteName() === 'resourcesNew' || FlowRouter.getRouteName() === 'workNew' || FlowRouter.getRouteName() === 'workEdit') {
			return Session.get('selectedResourceNewType');
		}

		if (FlowRouter.getRouteName() === 'resourcesEdit') {
			return FlowRouter.getParam('selectedResourceCurrentTypeId');		
		}
	},

	activeComponent: function(resourceFormType, componentType) {
		if (resourceFormType === componentType) {
			return true;
		}
		return false;
	},

	isResourceRoute: function(currentRouteName) {
		if (currentRouteName === 'resourcesNew' || currentRouteName === 'resourcesEdit') {
			return true;
		}
		return false;
	},

	titlePlaceholder: function() {
		let type = Session.get('currentType');
		if (type === 'book') {
			return 'The Outsiders'
		}
		if (type === 'link') {
			return 'Flexible Homeschool'
		}
		if (type === 'video') {
			return 'John Adams Miniseries'
		}
		if (type === 'audio') {
			return 'Strait Out of the Box'
		}
		if (type === 'app') {
			return 'Mavis Beacon Teaches Typing'
		}
	},

	linkPlaceholder: function() {
		let type = Session.get('currentType');
		if (type === 'book') {
			return 'http://www.amazon.com'
		}
		if (type === 'link') {
			return 'http://www.aflexiblehomeschool.com'
		}
		if (type === 'video') {
			return 'http://www.hbo.com/john-adams'
		}
		if (type === 'audio') {
			return 'http://www.itunes.com'
		}
		if (type === 'app') {
			return 'http://www.mavisbeaconfree.com/'
		}
	},

	descriptionPlaceholder: function() {
		let type = Session.get('currentType');
		if (type === 'book') {
			return 'Ponyboy Curtis is leaving...'
		}
		if (type === 'link') {
			return 'A great homeschool plan...'
		}
		if (type === 'video') {
			return 'Adapted from David McCull...'
		}
		if (type === 'audio') {
			return 'The first box set from...'
		}
		if (type === 'app') {
			return 'The best typing tutor...'
		}
	},

	selectedResourceType: function() {
		return Session.get('selectedResourceType');
	},

	selectedResourceAvailability: function() {
		return Session.get('selectedResourceAvailability');
	},

	selectedResourceId: function() {
		return Session.get('selectedResourceId');
	},

	selectedResourceCurrentTypeId: function() {
		return Session.get('selectedResourceCurrentTypeId');
	},

	selectedResourceNewType: function() {
		return Session.get('selectedResourceNewType')
	},

	submitLabel: function() {
		if (FlowRouter.getRouteName() === 'resourcesNew') {
			return 'Save';
		}

		if (FlowRouter.getRouteName() === 'resourcesEdit') {
			return 'Update';		
		}
	},
});

Template.resourcesForm.events({
	'submit .js-form-new-resource'(event) {
		event.preventDefault();
	},

	// 'click .js-create-edit'(event) {
	// 	event.preventDefault();
	// 	$('.js-form-new-resource').submit();
	// },

	'click .js-cancel'(event) {
		event.preventDefault();

		if (window.screen.availWidth > 768) {
			FlowRouter.go('/planning/resources/view/3/' + Session.get('selectedResourceType') + '/' + Session.get('selectedResourceAvailability') + '/' + Session.get('selectedResourceId') + '/' + Session.get('selectedResourceCurrentTypeId'))
		} else {
			FlowRouter.go('/planning/resources/view/2/' + Session.get('selectedResourceType') + '/' + Session.get('selectedResourceAvailability') + '/' + Session.get('selectedResourceId') + '/' + Session.get('selectedResourceCurrentTypeId'))
		}

	},
});