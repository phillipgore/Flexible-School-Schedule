import {Template} from 'meteor/templating';
import {emailValidation, requiredValidation} from '../../../../modules/functions';

import moment from 'moment';
import _ from 'lodash';
import gpw from 'generate-random-password';

import './officeAccountsNew.html';

Template.officeAccountsNew.onCreated( function() {

});

Template.officeAccountsNew.onRendered( function() {	
	$('#free-trial-expiration').pickadate({
		format: 'mmmm d, yyyy',
		today: 'Today',
		clear: 'Clear',
		close: 'Close',
		min: new Date(),
	});
});

Template.officeAccountsNew.helpers({
	relationships: [
		{label: 'User is Mom', value: 'Mom'},
		{label: 'User is Dad', value: 'Dad'},
		{label: 'User is Brother', value: 'Brother'},
		{label: 'User is Sister', value: 'Sister'},
		{label: 'User is Tutor', value: 'Tutor'},
		{label: 'User is Teacher', value: 'Teacher'},
		{label: 'User is Grandma', value: 'Grandma'},
		{label: 'User is Grandpa', value: 'Grandpa'},
		{label: 'User is Aunt', value: 'Aunt'},
		{label: 'User is Uncle', value: 'Uncle'},
		{label: 'User is An Only Child - Boy', value: 'Only Boy'},
		{label: 'User is An Only Child - Girl', value: 'Only Girl'},
		{label: 'User is An Unrelated Male', value: 'Unrelated Male'},
		{label: 'User is An Unrelated Female', value: 'Unrelated Female'},
	],

	initialPassword: function() {
		return gpw.generateRandomPassword( 8, 0 );
	},

	todaysDate: function() {
		return new Date();
	},

	selectedStatusId: function() {
		return Session.get('selectedStatusId');
	},

	selectedGroupId: function() {
		return Session.get('selectedGroupId');
	}
});

Template.officeAccountsNew.events({
	'submit .js-form-create-account'(event) {
		event.preventDefault();

		let group = {
			subscriptionStatus: 'freeTrial', 
			freeTrial: { 
				expiration: event.currentTarget.freeTrialExpiration.value.trim(),
				initialPassword: event.target.password.value.trim(),
			},
			initialIds: {
				studentId: 'empty',
				schoolYearId: 'empty',
				resourceId: 'empty',
				resourceType: 'empty',
				termId: 'empty',
				weekId: 'empty',
				schoolWorkId: 'empty',
				schoolWorkType: 'work',
				userId: 'empty',
				reportId: 'empty',
				groupId: 'empty',
			}
		}

		let user = {
			email: event.target.email.value.trim(),
			password: event.target.password.value.trim(),
			info: {
				firstName: event.target.firstName.value.trim(),
				lastName: event.target.lastName.value.trim(),
				relationshipToStudents: event.target.relationshipToStudents.value.trim(),
				role: 'Administrator',
				groupId: null,
			},
			status: {
				active: true,
				updatedOn: new Date(),
			}
		}

		let accountForm = [];
		if (requiredValidation(user.info.firstName)) {
			$('#first-name').removeClass('error');
			$('.first-name-errors').text('');
		} else {
			$('#first-name').addClass('error');
			$('.first-name-errors').text('Required.');
			accountForm.push(false);
		}

		if (requiredValidation(user.info.lastName)) {
			$('#last-name').removeClass('error');
			$('.last-name-errors').text('');
		} else {
			$('#last-name').addClass('error');
			$('.last-name-errors').text('Required.');
			accountForm.push(false);
		}

		if (requiredValidation(user.email)) {
			$('#email').removeClass('error');
			$('.email-errors').text('');

			if (emailValidation(user.email)) {
				$('#email').removeClass('error');
				$('.email-errors').text('');
			} else {
				$('#email').addClass('error');
				$('.email-errors').text('Please enter a valid email address.');
				accountForm.push(false);
			}

		} else {
			$('#email').addClass('error');
			$('.email-errors').text('Required.');
			accountForm.push(false);
		}
		
		if (requiredValidation(group.freeTrial.expiration)) {
			$('#free-trial-expiration').removeClass('error');
			$('.free-trial-expiration-errors').text('');
		} else {
			$('#free-trial-expiration').addClass('error');
			$('.free-trial-expiration-errors').text('Required.');
			accountForm.push(false);
		}

		
		if (accountForm.indexOf(false) === -1) {
			$('.js-saving').show();
			$('.js-submit').prop('disabled', true);
			Meteor.call('insertFreeTrial', group, user, function(error, groupId) {
				if (error && error.reason != 'unverified') {
					Alerts.insert({
						colorClass: 'bg-danger',
						iconClass: 'icn-danger',
						message: error.reason,
					});
			
					$('.js-saving').hide();
					$('.js-submit').prop('disabled', false);
				} else { 
					Meteor.call('runAppAdminInitialId');
					FlowRouter.go('/office/accounts/view/2/freeTrial' + groupId);
				}
			})

			return false;
		}
	},
});