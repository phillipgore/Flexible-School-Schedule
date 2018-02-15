import {Template} from 'meteor/templating';
import { Groups } from '../../../../api/groups/groups.js';
import moment from 'moment';
import './billingList.html';

Template.billingList.onCreated( function() {
	// Subscriptions
	this.subscribe('group');

	Meteor.call('getCard', function(error, result) {
		if (error) {
			Alerts.insert({
				colorClass: 'bg-danger',
				iconClass: 'fss-danger',
				message: error.reason,
			});
		} else {
			Session.set('card', result);
		}
	})
});

Template.billingList.onRendered( function() {
	// Toolbar Settings
	Session.set({
		leftUrl: '/settings/list',
		leftIcon: 'fss-back',
		label: 'Billing',
		rightUrl: '',
		rightIcon: '',
	});

	// Navbar Settings
	Session.set('activeNav', 'settingsList');
});

Template.billingList.helpers({
	user: function() {
		return Meteor.users.findOne();
	},

	group: function() {
		return Groups.findOne({});
	},

	cardClass: function() {
		if (!Session.get('card')) {
			return 'fss-billing';
		}
		let brand = Session.get('card').brand;		
		if (brand === 'Visa') {
			return 'fss-cc-visa';
		}
		if (brand === 'American Express') {
			return 'fss-cc-amex';
		}
		if (brand === 'MasterCard') {
			return 'fss-cc-master-card';
		}
		if (brand === 'Discover') {
			return 'fss-cc-discover';
		}
		if (brand === 'JCB') {
			return 'fss-cc-jcb';
		}
		if (brand === 'Diners Club') {
			return 'fss-cc-diners';
		}
		if (brand === 'Unknown') {
			return 'fss-billing';
		}
	},

	accountPausedOrPending: function (subscriptionStatus) {
		if (subscriptionStatus === 'pausePending' || subscriptionStatus === 'paused') {
			return true;
		}
		return false;
	},

	accountPausePending: function (subscriptionStatus) {
		if (subscriptionStatus === 'pausePending') {
			return true;
		}
		return false;
	},

	accountPaused: function (subscriptionStatus) {
		if (subscriptionStatus === 'paused') {
			return true;
		}
		return false;
	},
});

Template.billingList.events({
	'click .js-pause-account'(event) {
		event.preventDefault();

		let groupId = $('.js-pause-account').attr('id');

		Meteor.call('pauseSubscription', function(error, result) {
			if (error) {
				Alerts.insert({
					colorClass: 'bg-danger',
					iconClass: 'fss-danger',
					message: error.reason,
				});
			} else {
				let date = new Date(result.current_period_end * 1000);
				let subscriptionPausedOn = date.toUTCString();

				let groupProperties = {
					subscriptionStatus: 'pausePending', 
					subscriptionPausedOn: subscriptionPausedOn,
				}

				Meteor.call('updateGroup', groupId, groupProperties, function(error) {
					if (error) {
						Alerts.insert({
							colorClass: 'bg-danger',
							iconClass: 'fss-danger',
							message: error.reason,
						});
					} else {
						Alerts.insert({
							colorClass: 'bg-info',
							iconClass: 'fss-info',
							message: 'Your account has been paused. You may unpause it at anytime.',
						});
					}
				});
			}
		})
	},

	'click .js-unpause-account'(event) {
		event.preventDefault();

		let groupId = $('.js-unpause-account').attr('id');

		Meteor.call('unpauseSubscription', function(error, result) {
			if (error) {
				Alerts.insert({
					colorClass: 'bg-danger',
					iconClass: 'fss-danger',
					message: error.reason,
				});
			} else {
				let groupProperties = {
					subscriptionStatus: 'active',
					stripeSubscriptionId: result.id,
				}

				Meteor.call('updateGroup', groupId, groupProperties, function(error) {
					if (error) {
						Alerts.insert({
							colorClass: 'bg-danger',
							iconClass: 'fss-danger',
							message: error.reason,
						});
					} else {
						Alerts.insert({
							colorClass: 'bg-info',
							iconClass: 'fss-info',
							message: 'Your account has been unpaused. Welcome back.',
						});
					}
				});
			}
		})
	},

});