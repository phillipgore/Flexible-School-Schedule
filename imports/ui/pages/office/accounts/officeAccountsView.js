import { Template } from 'meteor/templating';
import { Groups } from '../../../../api/groups/groups.js';
import './officeAccountsView.html';

Template.officeAccountsView.onCreated( function() {
	let template = Template.instance();

	template.autorun(() => {
		this.accountData = Meteor.subscribe('account', FlowRouter.getParam('selectedGroupId'));
		this.accountTotals = Meteor.subscribe('accountTotals', FlowRouter.getParam('selectedGroupId'));
	});

});

Template.officeAccountsView.onRendered(function()  {

});

Template.officeAccountsView.helpers({
	subscriptionReady: function() {
		if (Template.instance().accountData.ready() && Template.instance().accountTotals.ready()) {
			return true;
		}
		return false;
	},

	group: function() {
		return Groups.findOne({ _id: FlowRouter.getParam('selectedGroupId')});
	},

	admin: function() {
		return Meteor.users.findOne({'info.groupId': FlowRouter.getParam('selectedGroupId'), 'info.role': 'Administrator'}, {sort: {createdAt: 1}});
	},

	users: function() {
		return Meteor.users.find({'info.groupId': FlowRouter.getParam('selectedGroupId')}, {sort: {createdAt: 1}});
	},

	isPending(status) {
		if (status === 'pausePending') {
			return 'Pause Pending';
		}
		return status;
	},
});

Template.officeAccountsView.events({
	'click .js-impersonate-admin': function(event) {
		Meteor.call('impersonateAdmin', event.currentTarget.id, function(error) {
			if (error) {
				Alerts.insert({
					colorClass: 'bg-danger',
					iconClass: 'icn-danger',
					message: error.reason,
				});
			} else {
				Meteor.connection.setUserId(event.currentTarget.id);
				Session.set({
					isImpersonation: true,
					appAdminId: Meteor.userId(),
					selectedFramePosition: '',
					selectedFrameClass: '',
					selectedStudentId: '',
					selectedSchoolYearId: '',
					selectedResourceType: '',
					selectedResourceAvailability: '',
					selectedResourceId: '',
					selectedResourceCurrentTypeId: '',
					selectedTermId: '',
					selectedReportingTermId: '',
					selectedWeekId: '',
					selectedReportingWeekId: '',
					selectedSchoolWorkId: '',
					selectedSchoolWorkType: '',
					selectedReportId: '',
					selectedUserId: '',
					planningPathName: '',
					selectedGroupId: '',
				})
				FlowRouter.go('/')
			}
		});
	},

	'click .js-correct-ids': function(event) {
		$(event.currentTarget).text('Correcting Initial Ids...')
		let groupId = $(event.currentTarget).attr('data-group-id');

		Meteor.call('runGroupInitialIds', groupId, function(error) {
			if (error) {
				Alerts.insert({
					colorClass: 'bg-danger',
					iconClass: 'icn-danger',
					message: error.reason,
				});
				$(event.currentTarget).text('Correct Initial Ids');
			} else { 
				Alerts.insert({
					colorClass: 'bg-success',
					iconClass: 'icn-planning',
					message: 'Initial Ids have been corrected.',
				});
				$(event.currentTarget).text('Correct Initial Ids');
			}
		})
	},

	'click .js-correct-paths': function(event) {
		$(event.currentTarget).text('Correcting Paths...')
		let groupId = $(event.currentTarget).attr('data-group-id');

		Meteor.call('runGroupPaths', groupId, function(error) {
			if (error) {
				Alerts.insert({
					colorClass: 'bg-danger',
					iconClass: 'icn-danger',
					message: error.reason,
				});
				$(event.currentTarget).text('Correct Paths');
			} else { 
				Alerts.insert({
					colorClass: 'bg-success',
					iconClass: 'icn-planning',
					message: 'Paths have been corrected.',
				});
				$(event.currentTarget).text('Correct Paths');
			}
		})
	},

	'click .js-correct-stats': function(event) {
		$(event.currentTarget).text('Correcting Stats...')
		let groupId = $(event.currentTarget).attr('data-group-id');

		Meteor.call('runGroupStats', groupId, function(error) {
			if (error) {
				Alerts.insert({
					colorClass: 'bg-danger',
					iconClass: 'icn-danger',
					message: error.reason,
				});
				$(event.currentTarget).text('Correct Stats');
			} else { 
				Alerts.insert({
					colorClass: 'bg-success',
					iconClass: 'icn-planning',
					message: 'Stats have been corrected.',
				});
				$(event.currentTarget).text('Correct Stats');
			}
		})
	},

	'click .js-update-mailchimp-tags': function(event) {
		$(event.currentTarget).text('Updating Tags...')
		let groupId = $(event.currentTarget).attr('id');

		Meteor.call('mcTags', groupId, function(error) {
			if (error) {
				Alerts.insert({
					colorClass: 'bg-danger',
					iconClass: 'icn-danger',
					message: error,
				});
				$(event.currentTarget).text('Update MC Tags');
			} else { 
				Alerts.insert({
					colorClass: 'bg-success',
					iconClass: 'icn-planning',
					message: 'Tags have been updated.',
				});
				$(event.currentTarget).text('Update MC Tags');
			}
		});
	},

	'click .js-update-stripe-info': function(event) {
		$(event.currentTarget).text('Updating Stripe...')
		let stripeCustomerId = $(event.currentTarget).attr('id');

		Meteor.call('updateCustomer', stripeCustomerId, function(error) {
			if (error) {
				Alerts.insert({
					colorClass: 'bg-danger',
					iconClass: 'icn-danger',
					message: error,
				});
				$(event.currentTarget).text('Update Stripe Info');
			} else { 
				Alerts.insert({
					colorClass: 'bg-success',
					iconClass: 'icn-planning',
					message: 'Stripe data has been updated.',
				});
				$(event.currentTarget).text('Update Stripe Info');
			}
		})
	},
});
