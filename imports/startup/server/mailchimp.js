import {Groups} from '../../api/groups/groups.js';

import Mailchimp from 'mailchimp-api-v3';
import md5 from 'md5';
import _ from 'lodash';

const mailchimp = new Mailchimp(Meteor.settings.private.mailchimp);


Meteor.methods({
	mcSubscription: function(mcSubscriptionProperties) {
		mailchimp.put('/lists/' + Meteor.settings.private.mailchimpListId + '/members/' + mcSubscriptionProperties.emailHash, {
			"email_address": mcSubscriptionProperties.email,
			"status": "subscribed",
			"merge_fields": {
				"FNAME": mcSubscriptionProperties.firstName,
				"LNAME": mcSubscriptionProperties.lastName
			}
		}).catch(function (error) {
			console.log(error);
		})
	},

	mcUpdate: function(mcSubscriptionProperties) {
		mailchimp.patch('/lists/' + Meteor.settings.private.mailchimpListId + '/members/' + mcSubscriptionProperties.emailHash, {
			"email_address": mcSubscriptionProperties.email,
			"merge_fields": {
				"FNAME": mcSubscriptionProperties.firstName,
				"LNAME": mcSubscriptionProperties.lastName
			}
		}).catch(function (error) {
			console.log(error);
		})
	},

	mcTags: function(groupId) {
		let group = Groups.findOne({_id: groupId});
		let tagProperties = [
			{"name": "pending", "status": "inactive"},
			{"name": "active", "status": "inactive"},
			{"name": "freeTrial", "status": "inactive"},
			{"name": "pausePending", "status": "inactive"},
			{"name": "paused", "status": "inactive"},
			{"name": "freeTrialExpired", "status": "inactive"},
			{"name": "error", "status": "inactive"},
		];
		let tagName = group.subscriptionStatus.trim();
		let tagUpdateIndex = tagProperties.findIndex((tag => tag.name === tagName));
		tagProperties[tagUpdateIndex].status = "active";
		let users = Meteor.users.find({'info.groupId': groupId});

		users.forEach(user => {
			let email = user.emails[0].address;
			let emailHash = md5(email);

			mailchimp.post('/lists/' + Meteor.settings.private.mailchimpListId + '/members/' + emailHash + '/tags', {
				"tags": tagProperties
			}).catch(function (error) {
				throw new Meteor.Error(500, error.detail);
			})

			mailchimp.post('/lists/' + Meteor.settings.private.mailchimpInterestListId + '/members/' + emailHash + '/tags', {
				"tags": [{"name": "user", "status": "active"}]
			}).catch(function (error) {
				throw new Meteor.Error(500, error.detail);
			})
		})
	}
});