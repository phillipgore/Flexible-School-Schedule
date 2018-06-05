import {Template} from 'meteor/templating';
import {Groups} from '../../../api/groups/groups.js';
import _ from 'lodash'
import './settingsList.html';

Template.settingsList.onCreated( function() {
	// Subscriptions
	this.subscribe('group');
});

Template.settingsList.onRendered( function() {
	Session.set({
		labelOne: 'Settings',
		activeNav: 'settingsList',
	});
});

Template.settingsList.helpers({
	user: function() {
		return Meteor.users.findOne();
	},

	userRestricted: function(role) {
		if (role === 'Observer' || role === 'User' || role === 'Application Administrator' || role === 'Developer') {
			return true;
		}
		return false;
	},

	applicationAdministrator: function(role) {
		if (role === 'Application Administrator' || role === 'Developer') {
			return true;
		}
		return false;
	},

	group: function() {
		return Groups.findOne({});
	},

	selectedUserId: function() {
		return Session.get('selectedUserId');
	},

	billingPath: function() {
		return Session.get('billingPath');
	},

	active: function(currentRoute, route) {
		if (currentRoute === route) {
			return true;
		}
		return false;
	},
});

Template.settingsList.events({
	'click .js-restricted '(event) {
		let role = $(event.currentTarget).attr('data-role');
		let section = $(event.currentTarget).attr('data-section');
		function message(role) {
			if (role ==='Application Administrator' || role === 'Developer') {
				return 'Your role of "' + role + '" does not currently have this functionality.'
			}
			return 'Your role of "' + role + '" does not allow access to the ' + _.capitalize(section) + ' section.'
		}
		Alerts.insert({
			colorClass: 'bg-info',
			iconClass: 'fss-info',
			message: message(role),
		});
	},

	'click .js-add-test-data'(event) {
		event.preventDefault();
		$('.list-item-loading').show();

		Meteor.call('addTestData', function(error, result) {
			if (error) {
				Alerts.insert({
					colorClass: 'bg-danger',
					iconClass: 'fss-danger',
					message: error.reason,
				});
				$('.list-item-loading').hide();
			} else {
				$('.list-item-loading').hide();
				Alerts.insert({
					colorClass: 'bg-info',
					iconClass: 'fss-info',
					message: 'Test data has been added. You may remove it at anytime.',
				});
			}
		});
	},

	'click .js-remove-test-data'(event) {
		event.preventDefault();
		$('.list-item-loading').show();

		Meteor.call('removeTestData', function(error, result) {
			if (error) {
				Alerts.insert({
					colorClass: 'bg-danger',
					iconClass: 'fss-danger',
					message: error.reason,
				});
				$('.list-item-loading').hide();
			} else {
				$('.list-item-loading').hide();
				Alerts.insert({
					colorClass: 'bg-info',
					iconClass: 'fss-info',
					message: 'All test data has been removed. You may add it back at anytime.',
				});
			}
		})
	},

	'click .js-sign-out'(event) {
		event.preventDefault();
		$('.loading-signing-out').show();
		Accounts.logout(function(error) {
			if (error) {
				Alerts.insert({
					colorClass: 'bg-danger',
					iconClass: 'fss-danger',
					message: error.reason,
				});
			} else {
				FlowRouter.go("/sign-in");
			}
		});
	},
});