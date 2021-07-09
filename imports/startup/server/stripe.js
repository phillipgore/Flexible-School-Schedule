import {Groups} from '../../api/groups/groups';
import {Answers} from '../../api/answers/answers';
import stripePackage from 'stripe';
const stripe = stripePackage(Meteor.settings.private.stripe);
import _ from 'lodash';


Meteor.methods({
	createSubscription: async function(groupId, cardId, subscriptionProperties) {
		let updatedGroupProperties = {
			subscriptionStatus: 'pending',
			stripeCardId: cardId,
			stripeCouponCodes: subscriptionProperties.subscription.coupon,
			stripeCurrentCouponCode: {
				startDate: null,
				endDate: null,
				id: null,
				amountOff: null,
				percentOff: null,
			},
		};

		let result = await stripe.customers.create(
			subscriptionProperties.customer
		).then((customer) => {
			updatedGroupProperties.stripeCustomerId = customer.id;
			subscriptionProperties.subscription.customer = customer.id;

			return stripe.subscriptions.create(
				subscriptionProperties.subscription
			);
		}).then((subscription) => {
			updatedGroupProperties.subscriptionStatus = 'active';
			updatedGroupProperties.stripeSubscriptionId = subscription.id;
			updatedGroupProperties.subscriptionErrorMessage = null;

			if (subscription.discount) {
				updatedGroupProperties.stripeCurrentCouponCode.startDate = subscription.discount.start;
				updatedGroupProperties.stripeCurrentCouponCode.endDate = subscription.discount.end;
				updatedGroupProperties.stripeCurrentCouponCode.id = subscription.discount.coupon.id;
				updatedGroupProperties.stripeCurrentCouponCode.amountOff = subscription.discount.coupon.amount_off;
				updatedGroupProperties.stripeCurrentCouponCode.percentOff = subscription.discount.coupon.percent_off;
				updatedGroupProperties.stripeCurrentCouponCode.durationInMonths = subscription.discount.coupon.duration_in_months;
			}

			return subscription;
		}).catch((error) => {
			updatedGroupProperties.subscriptionStatus = 'error';
			updatedGroupProperties.subscriptionErrorMessage = error.message;
		});

		Groups.update(groupId, {$set: updatedGroupProperties}, function(error, result) {
			if (error) {
				throw new Meteor.Error(500, error);
			} else {
				Meteor.call('mcTags', groupId);
				return result;
			}
		});
	},

	applyCoupon: async function(stripeSubscriptionId, stripeCouponCode) {
		let groupId = Meteor.user().info.groupId;
		let updatedGroupProperties = {
			stripeCurrentCouponCode: {
				startDate: null,
				endDate: null,
				id: null,
				amountOff: null,
				percentOff: null,
			},
		}
		
		let result = await stripe.subscriptions.update(
			stripeSubscriptionId, 
			{coupon: stripeCouponCode.toLowerCase()}
		).then((subscription) => {
			updatedGroupProperties.stripeCurrentCouponCode.startDate = subscription.discount.start;
			updatedGroupProperties.stripeCurrentCouponCode.endDate = subscription.discount.end;
			updatedGroupProperties.stripeCurrentCouponCode.id = subscription.discount.coupon.id;
			updatedGroupProperties.stripeCurrentCouponCode.amountOff = subscription.discount.coupon.amount_off;
			updatedGroupProperties.stripeCurrentCouponCode.percentOff = subscription.discount.coupon.percent_off;
			updatedGroupProperties.stripeCurrentCouponCode.durationInMonths = subscription.discount.coupon.duration_in_months;

			return subscription;
		}).catch((error) => {
			throw new Meteor.Error(500, error.message);
		});

		Groups.update(groupId, {
			$set: updatedGroupProperties, 
			$push: {stripeCouponCodes: stripeCouponCode}
		}, function(error, result) {
			if (error) {
				throw new Meteor.Error(500, error);
			} else {
				return result;
			}
		});
	},

	pauseSubscription: async function(answerProperties) {
		let groupId = Meteor.user().info.groupId;
		let subscriptionId = Groups.findOne({_id: groupId}).stripeSubscriptionId;
		let groupProperties = {
			subscriptionStatus: 'pausePending', 
		}

		let result = await stripe.subscriptions.del(
			subscriptionId, {at_period_end: true}
		).then((confirmation) => {
			let date = new Date(confirmation.current_period_end * 1000);
			groupProperties.subscriptionPausedOn = date.toUTCString();
		}).catch((error) => {
			throw new Meteor.Error(500, error.message);
		});

		answerProperties.forEach(answer => {
			Answers.insert(answer);
		})

		Groups.update(groupId, {$set: groupProperties}, function(error, result) {
			if (error) {
				throw new Meteor.Error(500, error);
			} else {
				Meteor.call('mcTags', groupId);
				return result;
			}
		});
	},

	unpauseSubscription: async function() {
		let groupId = Meteor.user().info.groupId;
		let group = Groups.findOne({_id: groupId});

		let updatedGroupProperties = {
			subscriptionStatus: group.subscriptionStatus,
			stripeSubscriptionId: group.stripeSubscriptionId,
			subscriptionErrorMessage: group.subscriptionErrorMessage,
			stripeCurrentCouponCode: {
				startDate: group.startDate,
				endDate: group.endDate,
				id: group.id,
				amountOff: group.amountOff,
				percentOff: group.percentOff,
			},
		}

		let result = await stripe.subscriptions.retrieve(
			group.stripeSubscriptionId
		).then((subscription) => {
			return stripe.subscriptions.update(subscription.id, {
				cancel_at_period_end: false,
				items: [{
					id: subscription.items.data[0].id,
					plan: Meteor.settings.public.stripePlanId,
				}]
			});
		}).then((subscription) => {
			updatedGroupProperties.subscriptionStatus = 'active';
			updatedGroupProperties.stripeSubscriptionId = subscription.id;
			updatedGroupProperties.subscriptionErrorMessage = null;

			if (subscription.discount) {
				updatedGroupProperties.stripeCurrentCouponCode.startDate = subscription.discount.start;
				updatedGroupProperties.stripeCurrentCouponCode.endDate = subscription.discount.end;
				updatedGroupProperties.stripeCurrentCouponCode.id = subscription.discount.coupon.id;
				updatedGroupProperties.stripeCurrentCouponCode.amountOff = subscription.discount.coupon.amount_off;
				updatedGroupProperties.stripeCurrentCouponCode.percentOff = subscription.discount.coupon.percent_off;
				updatedGroupProperties.stripeCurrentCouponCode.durationInMonths = subscription.discount.coupon.duration_in_months;
			}
			return subscription;
		}).catch((error) => {
			throw new Meteor.Error(500, error.message);
		});

		Groups.update(groupId, {$set: updatedGroupProperties}, function(error, result) {
			if (error) {
				throw new Meteor.Error(500, error);
			} else {
				Meteor.call('mcTags', groupId);
				return result;
			}
		});
	},

	unpauseCanceledSubscription: async function(couponCode) {
		let groupId = Meteor.user().info.groupId;
		let group = Groups.findOne({_id: groupId});

		let updatedGroupProperties = {
			subscriptionStatus: group.subscriptionStatus,
			stripeSubscriptionId: group.stripeSubscriptionId,
			subscriptionErrorMessage: group.subscriptionErrorMessage,
			stripeCurrentCouponCode: {
				startDate: group.startDate,
				endDate: group.endDate,
				id: group.id,
				amountOff: group.amountOff,
				percentOff: group.percentOff,
			},
		}

		let subscriptionProperties = {
			customer: group.stripeCustomerId,
			items: [{plan: Meteor.settings.public.stripePlanId}]
		}

		if (couponCode.length) {
			subscriptionProperties.coupon = couponCode.trim().toLowerCase();
		}

		let result = await stripe.subscriptions.create(
			subscriptionProperties
		).then((subscription) => {
			updatedGroupProperties.subscriptionStatus = 'active';
			updatedGroupProperties.stripeSubscriptionId = subscription.id;
			updatedGroupProperties.subscriptionErrorMessage = null;

			if (subscription.discount) {
				updatedGroupProperties.stripeCurrentCouponCode.startDate = subscription.discount.start;
				updatedGroupProperties.stripeCurrentCouponCode.endDate = subscription.discount.end;
				updatedGroupProperties.stripeCurrentCouponCode.id = subscription.discount.coupon.id;
				updatedGroupProperties.stripeCurrentCouponCode.amountOff = subscription.discount.coupon.amount_off;
				updatedGroupProperties.stripeCurrentCouponCode.percentOff = subscription.discount.coupon.percent_off;
				updatedGroupProperties.stripeCurrentCouponCode.durationInMonths = subscription.discount.coupon.duration_in_months;
			}
			return subscription;
		}).catch((error) => {
			throw new Meteor.Error(500, error.message);
		});

		Groups.update(groupId, {$set: updatedGroupProperties}, function(error, result) {
			if (error) {
				throw new Meteor.Error(500, error);
			} else {
				Meteor.call('mcTags', groupId);
				return result;
			}
		});
	},

	getSubscription: async function(subscriptionId) {
		let result = await stripe.subscriptions.retrieve(
			subscriptionId
		).then((subscription) => {
			return subscription;
		}).catch((error) => {
			throw new Meteor.Error(500, error.message);
		});

		return result;
	},

	getSubscriptionDiscount: async function() {
		let groupId = Meteor.user().info.groupId;
		let subscriptionId = Groups.findOne({_id: groupId}).stripeSubscriptionId;

		let result = await stripe.subscriptions.retrieve(
			subscriptionId
		).then((subscription) => {
			return subscription.discount;
		}).catch((error) => {
			throw new Meteor.Error(500, error.message);
		});

		return result;
	},

	getCard: async function() {
		let groupId = Meteor.user().info.groupId;
		let customerId = Groups.findOne({_id: groupId}).stripeCustomerId;
		let cardId = Groups.findOne({_id: groupId}).stripeCardId;

		let result = await stripe.customers.retrieveCard(
			customerId, cardId
		).then((card) => {
			return card;
		}).catch((error) => {
			throw new Meteor.Error(500, error.message);
		});

		return result;
	},

	getCardBrand: async function() {
		let groupId = Meteor.user().info.groupId;
		let customerId = Groups.findOne({_id: groupId}).stripeCustomerId;
		let cardId = Groups.findOne({_id: groupId}).stripeCardId;

		let result = await stripe.customers.retrieveCard(
			customerId, cardId
		).then((card) => {
			return card;
		}).catch((error) => {
			throw new Meteor.Error(500, error.message);
		});

		return result.brand;
	},

	getCouponList: async function() {
		let result = await stripe.coupons.list(
			
		).then((couponList) => {
			return couponList;
		}).catch((error) => {
			throw new Meteor.Error(500, error.message);
		});

		return result;
	},

	getCoupon: async function(couponId) {
		let result = await stripe.coupons.retrieve(
			couponId
		).then((coupon) => {
			return coupon;
		}).catch((error) => {
			throw new Meteor.Error(500, error.message);
		});

		return result;
	},

	getInvoices: async function() {
		let groupId = Meteor.user().info.groupId;
		let customerId = Groups.findOne({_id: groupId}).stripeCustomerId;

		let result = await stripe.invoices.list({
			customer: customerId, limit: 24
		}).then((invoices) => {
			return invoices;
		}).catch((error) => {
			throw new Meteor.Error(500, error.message);
		});

		return result;
	},

	getUpcomingInvoices: async function() {
		let groupId = Meteor.user().info.groupId;
		let customerId = Groups.findOne({_id: groupId}).stripeCustomerId;

		let result = await stripe.invoices.retrieveUpcoming(
			customerId
		).then((invoices) => {
			return invoices;
		}).catch((error) => {
			console.log(Meteor.Error(500, error.message));
		});

		return result;
	},

	getPlan: async function() {
		let result = await stripe.plans.retrieve(
			Meteor.settings.public.stripePlanId
		).then((plan) => {
			return plan;
		}).catch((error) => {
			throw new Meteor.Error(500, error.message);
		});

		return result;
	},

	updateCard: async function(tokenId) {
		let groupId = Meteor.user().info.groupId;
		let customerId = Groups.findOne({_id: groupId}).stripeCustomerId;
		let groupProperties = {
			subscriptionErrorMessage: null
		};

		let result = await stripe.customers.update(customerId, {
			source: tokenId
		}).then((customer) => {
			groupProperties.stripeCardId = customer.default_source;
		}).catch((error) => {
			throw new Meteor.Error(500, error.message);
		});

		Groups.update(groupId, {$set: groupProperties}, function(error, result) {
			if (error) {
				throw new Meteor.Error(500, error);
			} else {
				return result;
			}
		});
	},

	updateCustomer: async function(customerId) {
		let group = Groups.findOne({stripeCustomerId: customerId});
		
		let updatedGroupProperties = {
			subscriptionStatus: group.subscriptionStatus,
			stripeCustomerId: group.stripeCustomerId,
			stripeCardId: group.stripeCardId,
			stripeSubscriptionId: null,
			stripeCouponCodes: group.stripeCouponCodes,
			stripeCurrentCouponCode: {
				startDate: null,
				endDate: null,
				id: null,
				amountOff: null,
				percentOff: null,
			},
		};

		let result = await stripe.customers.retrieve(
			customerId
		).then((customer) => {
			let stripeCouponCodes = group.stripeCouponCodes;

			updatedGroupProperties.stripeCustomerId = customer.id;
			updatedGroupProperties.stripeCardId = customer.default_source;
			if (customer.subscriptions.data.length) {
				updatedGroupProperties.stripeSubscriptionId = customer.subscriptions.data[0].id;
				if (customer.subscriptions.data[0].discount) {
					updatedGroupProperties.stripeCurrentCouponCode.startDate = customer.subscriptions.data[0].discount.start;
					updatedGroupProperties.stripeCurrentCouponCode.endDate = customer.subscriptions.data[0].discount.end;
					updatedGroupProperties.stripeCurrentCouponCode.id = customer.subscriptions.data[0].discount.coupon.id;
					updatedGroupProperties.stripeCurrentCouponCode.amountOff = customer.subscriptions.data[0].discount.coupon.amount_off;
					updatedGroupProperties.stripeCurrentCouponCode.percentOff = customer.subscriptions.data[0].discount.coupon.percent_off;
					updatedGroupProperties.stripeCurrentCouponCode.durationInMonths = customer.subscriptions.data[0].discount.duration_in_months;

					stripeCouponCodes.push(customer.subscriptions.data[0].discount.coupon.id);
				}
			}

			updatedGroupProperties.stripeCouponCodes = _.uniq(stripeCouponCodes);
		}).catch((error) => {
			throw new Meteor.Error(500, error.message);
		});

		Groups.update({stripeCustomerId: customerId}, {$set: updatedGroupProperties}, function(error, result) {
			if (error) {
				throw new Meteor.Error(500, error);
			} else {
				return result;
			}
		});
	}
});






