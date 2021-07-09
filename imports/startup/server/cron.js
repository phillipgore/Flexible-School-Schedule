import {Groups} from '../../api/groups/groups.js';
import stripePackage from 'stripe';
const stripe = stripePackage(Meteor.settings.private.stripe);

import moment from 'moment';
import _ from 'lodash'
import {penniesToDolars} from '../../modules/server/functions';

SyncedCron.add({
	name: 'Free Trials And Dollar Trials',
	schedule: function(parser) {
		return parser.text('every 12 hours');
	},
	job: function() {
		let today = moment()
		let todayUnix = moment().unix();
		let price = parseInt(Meteor.settings.public.stripePlanPrice);
		
		let getTrialPrice = (price, percentOff) => {
			if (percentOff) {
				let percent = 1 - (percentOff / 100)
				return (price * percent).toFixed(2);
			}
			return price.toFixed(2);
		}

		let getPricingPhrase = (trialPrice, durationInMonths) => {
			if (trialPrice) {
				if (durationInMonths === 1) {
					return `30 Days for $${trialPrice}`;
				}
				return `${durationInMonths} month, $${trialPrice} per month`;
			}
			return `free, ${durationInMonths} month`;
		}

		let getDurationPhrasing = (durationInMonths) => {
			if (durationInMonths === 1) {
				return '30 day'
			}
			return durationInMonths + ' month'
		}

		let groups = Groups.find(
			{$or: [
				{
					subscriptionStatus: 'freeTrial'
				}, {
					subscriptionStatus: 'active', 
					'stripeCurrentCouponCode.endDate': {$gt: todayUnix}
				}
			]}
		).fetch();

		let freeTrialGroups = _.filter(groups, ['subscriptionStatus', 'freeTrial']);
		let trialCouponGroups = _.filter(_.reject(groups, ['subscriptionStatus', 'freeTrial']), group => {
			let groupCreatedOn = moment(group.createdOn).format('MDYYYY');
			let couponCodeStart = moment.unix(group.stripeCurrentCouponCode.startDate).format('MDYYYY');
			if (groupCreatedOn === couponCodeStart) {
				return group;
			}
		});	



		/* ==================== Free Trials ==================== */
		freeTrialGroups.map(group => {


			/* --------------- Expired Free Trials --------------- */
			if (moment().isAfter(group.freeTrial.expiration)) {
				Groups.update(group._id, {$set: {subscriptionStatus: 'freeTrialExpired'}}, function() {
					Meteor.call('mcTags', group._id);
				});
			}


			/* --------------- Free Trial Emails --------------- */
			let endingSoonDate = moment(group.freeTrial.expiration).subtract(7, 'd').unix();
			let endingSoonNoLaterThanDate = moment.unix(endingSoonDate).add(6, 'h').unix();

			let endingTomorrowDate = moment(group.freeTrial.expiration).subtract(1, 'd').unix();
			let endingTomorrowNoLaterThanDate = moment.unix(endingTomorrowDate).add(6, 'h').unix();


				/* ---------- Free Trial Ending Soon ---------- */
				if (today > endingSoonDate && today < endingSoonNoLaterThanDate) {
					let groupAdministrators = Meteor.users.find({'info.groupId': group._id, 'info.role': 'Administrator', 'emails.verified': true});
					let startDate = moment(group.createdOn).format('MMMM D, YYYY');
					let endDate = moment(group.freeTrial.expiration).format('MMMM D, YYYY');

					groupAdministrators.map(admin => {
						SSR.compileTemplate('freeTrialEmail', Assets.getText('freeTrialEmail.html'));

						var emailData = {
							firstName: admin.info.firstName,
							startDate: startDate,
							endDate: endDate,
						};

						Email.send({
							to: admin.emails[0].address,
							from: "Flexible Homeschool App <no-reply@aflexiblehomeschool.com>",
							subject: "Free Trial Ending Soon - Flexible Homeschool App",
							html: SSR.render('freeTrialEmail', emailData),
						});
					});
				}


				/* ---------- Free Trial Ending Tomorrow ---------- */
				if (today > endingTomorrowDate && today < endingTomorrowNoLaterThanDate) {
					let groupAdministrators = Meteor.users.find({'info.groupId': group._id, 'info.role': 'Administrator', 'emails.verified': true});
					let startDate = moment(group.createdOn).format('MMMM D, YYYY');
					let endDate = moment(group.freeTrial.expiration).format('MMMM D, YYYY');

					groupAdministrators.map(admin => {
						SSR.compileTemplate('freeTrialEmail', Assets.getText('freeTrialEmail.html'));

						var emailData = {
							firstName: admin.info.firstName,
							startDate: startDate,
							endDate: endDate,
						};

						Email.send({
							to: admin.emails[0].address,
							from: "Flexible Homeschool App <no-reply@aflexiblehomeschool.com>",
							subject: "Free Trial Ending Tomorrow - Flexible Homeschool App",
							html: SSR.render('freeTrialEmail', emailData),
						});
					});
				}


		})		



		/* ==================== Trial Coupon ==================== */
		trialCouponGroups.map(group => {

			/* --------------- Trial Coupon Emails --------------- */
			let endingSoonDate = moment.unix(group.stripeCurrentCouponCode.endDate).subtract(7, 'd').unix();
			let endingSoonNoLaterThanDate = moment.unix(endingSoonDate).add(6, 'h').unix();

			let endingTomorrowDate = moment.unix(group.stripeCurrentCouponCode.endDate).subtract(1, 'd').unix();
			let endingTomorrowNoLaterThanDate = moment.unix(endingTomorrowDate).add(6, 'h').unix();

			let percentOff = group.stripeCurrentCouponCode.percentOff;
			let durationInMonths = group.stripeCurrentCouponCode.durationInMonths;

			let trialPrice = getTrialPrice(price, percentOff);
			let trialPricingPhrase = getPricingPhrase(trialPrice, durationInMonths);


				/* ---------- Trial Coupon Ending Soon ---------- */
				if (today > endingSoonDate && today < endingSoonNoLaterThanDate) {
					let groupAdministrators = Meteor.users.find({'info.groupId': group._id, 'info.role': 'Administrator', 'emails.verified': true});
					
					groupAdministrators.map(admin => {
						SSR.compileTemplate('trialEndingSoon', Assets.getText('trialEndingSoon.html'));

						var emailData = {
							firstName: admin.info.firstName,
							trialPricingPhrase: trialPricingPhrase,
						};

						Email.send({
							to: admin.emails[0].address,
							from: "Flexible Homeschool App <no-reply@aflexiblehomeschool.com>",
							subject: `Your ${trialPricingPhrase} trial is ending soon.`,
							html: SSR.render('trialEndingSoon', emailData),
						});
					});
				}


				/* ---------- Trial Coupon Ending Tomorrow ---------- */
				if (today > endingTomorrowDate && today < endingTomorrowNoLaterThanDate) {
					let groupAdministrators = Meteor.users.find({'info.groupId': group._id, 'info.role': 'Administrator', 'emails.verified': true});
					
					groupAdministrators.map(admin => {
						SSR.compileTemplate('trialEndingTomorrow', Assets.getText('trialEndingTomorrow.html'));

						var emailData = {
							firstName: admin.info.firstName,
							trialPricingPhrase: trialPricingPhrase,
						};

						Email.send({
							to: admin.emails[0].address,
							from: "Flexible Homeschool App <no-reply@aflexiblehomeschool.com>",
							subject: `Your ${trialPricingPhrase} trial ends tomorrow.`,
							html: SSR.render('trialEndingTomorrow', emailData),
						});
					});
				}


		});

	}
});

SyncedCron.start();