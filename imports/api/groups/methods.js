import {Groups} from './groups.js';
import {primaryInitialIds} from '../../modules/server/initialIds';

import _ from 'lodash';

Meteor.methods({
	getInitialGroupIds: function() {
		let groupId = Meteor.users.findOne({_id: this.userId}).info.groupId;
		let group = Groups.findOne({_id: groupId});

		let initialGroupIds = {
			all: 'empty',
			online: 'empty',
			active: 'empty',
			pausePending: 'empty',
			paused: 'empty',
			error: 'empty',
			freeTrial: 'empty',
			freeTrialExpired: 'empty',
		}

		if (group.appAdmin) {
			let groups = Groups.find({appAdmin: false}, {fields: {createdOn: 1, subscriptionStatus: 1}, sort: {createdOn: -1}}).fetch();
			let onlineGroupIds = Meteor.users.find({'presence.status': 'online', 'info.groupId': {$ne: groupId}}).map(user => user.info.groupId);
			
			if (groups.length) {initialGroupIds.all = groups[0]._id};

			let online = _.filter(groups, group => _.includes(onlineGroupIds, group._id));
			if (online.length) {initialGroupIds.online = _.orderBy(online, ['createdOn'], ['desc'])[0]._id};

			let active = _.find(groups, ['subscriptionStatus', 'active']);
			if (active) {initialGroupIds.active = active._id};

			let pausePending = _.find(groups, ['subscriptionStatus', 'pausePending']);
			if (pausePending) {initialGroupIds.pausePending = pausePending._id};

			let paused = _.find(groups, ['subscriptionStatus', 'paused']);
			if (paused) {initialGroupIds.paused = paused._id};

			let error = _.find(groups, ['subscriptionStatus', 'error']);
			if (error) {initialGroupIds.error = error._id};

			let freeTrial = _.find(groups, ['subscriptionStatus', 'freeTrial']);
			if (freeTrial) {initialGroupIds.freeTrial = freeTrial._id};

			let freeTrialExpired = _.find(groups, ['subscriptionStatus', 'freeTrialExpired']);
			if (freeTrialExpired) {initialGroupIds.freeTrialExpired = freeTrialExpired._id};
		}

		return initialGroupIds;
	},

	insertGroup: function(userEmail) {
		if (Accounts.findUserByEmail(userEmail)) {
			throw new Meteor.Error(500, 'Email already exists.');
		} else {
			groupProperties = {
				subscriptionStatus: 'pending', 
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
			let groupId = Groups.insert(groupProperties);
			return groupId;
		}
	},

	updateGroup: function(groupProperties) {
		Groups.update(groupProperties._id, {$set: groupProperties}, function() {
			Meteor.call('mcTags', groupProperties._id);
		});
	},

	runPrimaryInitialIds: function() {
		primaryInitialIds();
	}
})