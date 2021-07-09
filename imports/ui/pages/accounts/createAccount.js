import {Template} from 'meteor/templating';
import Stripe from '../../../modules/stripe';
import {cardValidation, emailValidation, passwordValidation, requiredValidation} from '../../../modules/functions';
import './createAccount.html';

import moment from 'moment';

let getTrialPrice = (price, percentOff) => {
	if (percentOff) {
		let percent = 1 - (percentOff / 100)
		return (price * percent).toFixed(2);
	}
	return price.toFixed(2);
}

Template.createAccount.onCreated( function() {
	Session.set('validCoupon', true);
});

Template.createAccount.onRendered( function() {	
	Session.set('hideCoupon', false);
});

Template.createAccount.helpers({
	relationships: [
		{label: 'I Am Mom', value: 'Mom'},
		{label: 'I Am Dad', value: 'Dad'},
		{label: 'I Am Brother', value: 'Brother'},
		{label: 'I Am Sister', value: 'Sister'},
		{label: 'I Am Tutor', value: 'Tutor'},
		{label: 'I Am Teacher', value: 'Teacher'},
		{label: 'I Am Grandma', value: 'Grandma'},
		{label: 'I Am Grandpa', value: 'Grandpa'},
		{label: 'I Am Aunt', value: 'Aunt'},
		{label: 'I Am Uncle', value: 'Uncle'},
		{label: 'I Am An Only Child - Boy', value: 'Only Boy'},
		{label: 'I Am An Only Child - Girl', value: 'Only Girl'},
		{label: 'I Am An Unrelated Male', value: 'Unrelated Male'},
		{label: 'I Am An Unrelated Female', value: 'Unrelated Female'},
	],

	trialPrice: function() {
		let coupon = Session.get('coupon');
		if (coupon) {
			let price = parseInt(Meteor.settings.public.stripePlanPrice);
			let percentOff = Session.get('coupon').percent_off;
			return getTrialPrice(price, percentOff)
		}
		return 1;
	},

	trialDuration: function() {
		let coupon = Session.get('coupon');
		if (coupon) {
			let durationInMonths = Session.get('coupon').duration_in_months;
			if (durationInMonths === 1) {
				return '30 days'
			}
			return `${durationInMonths} months`
		}
		return '30 days'
	},

	buttonTrialPrice: function() {
		let coupon = Session.get('coupon');
		if (coupon) {
			let price = parseInt(Meteor.settings.public.stripePlanPrice);
			let percentOff = Session.get('coupon').percent_off;
			let trialPrice = getTrialPrice(price, percentOff);

			if (trialPrice === '0.00') {
				return 'Free';
			}
			return '$' + trialPrice;
		}
		return '$1';
	},

	buttonTrialDuration: function() {
		let coupon = Session.get('coupon');
		if (coupon) {
			let durationInMonths = Session.get('coupon').duration_in_months;
			if (durationInMonths === 1) {
				return ''
			}
			return `${durationInMonths} Month`
		}
		return ''
	},

	headingTrialDuration: function() {
		let coupon = Session.get('coupon');
		if (coupon) {
			let durationInMonths = Session.get('coupon').duration_in_months;
			if (durationInMonths === 1) {
				return '30 Days'
			}
			return `${durationInMonths} Months`
		}
		return '30 Days'
	},

	firstBillingDate: function() {
		let coupon = Session.get('coupon');
		if (coupon) {
			return moment().add(coupon.duration_in_months, 'months')
		}
		return moment().add(30, 'days');
	},

});

Template.createAccount.events({
	'click .js-billing-info'(event) {
		event.preventDefault();

		if (Alerts.findOne({_id: 'cc-info'})) {
			Alerts.remove({_id: 'cc-info'})
		} else {
			Alerts.insert({
				_id: 'cc-info',
				colorClass: 'bg-info',
				iconClass: 'icn-info',
				message: '<div class="p-tn-tb-6"><div class="font-weight-700 line-height-1">Uninterrupted Use</div><p class="line-height-1-75 m-tn-b-15">We ask for your credit card to allow your membership to continue after your trial, should you choose not to pause your account.</p> <div class="font-weight-700 line-height-1">Fraud Reduction</div><p class="line-height-1-75 m-tn-b-15">This also allows us to reduce fraud and prevent multiple trials for one person. Which helps us deliver quality service for honest customers.</p> <div class="font-weight-700 line-height-1">Pause Anytime</div><p class="line-height-1-75">You can pause your account anytime. We’ll even send you an email seven days before your trial is over to remind you it’s about to expire.</p></div>',
			});
		}
	},

	'submit .js-form-create-account'(event) {
		event.preventDefault();
		
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

		let subscriptionProperties = {
			customer: {
				email: user.email,
				metadata: {
					groupId: null,
				}
			},
			subscription: {
				customer: null,
				items: [{plan: Meteor.settings.public.stripePlanId}],
			},
		}

		if (event.target.coupon.value.trim().length) {
			subscriptionProperties.subscription.coupon = event.target.coupon.value.trim().toLowerCase();
		} else {
			subscriptionProperties.subscription.coupon = Meteor.settings.public.stripeSignUpDiscount;
		}

		let accountForm = [];
		let passwordsPresent = [];
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

		if (requiredValidation(subscriptionProperties.customer.email)) {
			$('#email').removeClass('error');
			$('.email-errors').text('');

			if (emailValidation(subscriptionProperties.customer.email)) {
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

		if (requiredValidation(user.password)) {
			$('#password').removeClass('error');
			$('.password-errors').text('');
			passwordsPresent.push(true);
		} else {
			$('#password').addClass('error');
			$('.password-errors').text('Required.');
			accountForm.push(false);
		}

		if (requiredValidation(event.target.retypePassword.value.trim())) {
			$('#retype-password').removeClass('error');
			$('.retype-password-errors').text('');
			passwordsPresent.push(true);
		} else {
			$('#retype-password').addClass('error');
			$('.retype-password-errors').text('Required.');
			accountForm.push(false);
		}

		if (passwordsPresent.length === 2) {
			if (passwordValidation(user.password, event.target.retypePassword.value.trim())) {
				$('#password, #retype-password').removeClass('error');
				$('.password-errors, .retype-password-errors').text('');
			} else {
				$('#password, #retype-password').addClass('error');
				$('.password-errors, .retype-password-errors').text('Passwords must match.');
				accountForm.push(false);
			}
		}

		Meteor.call('getCoupon', event.target.coupon.value.trim().toLowerCase(), function(error, result) {
			if (error && event.target.coupon.value.trim().length != 0) {
				$('#coupon').addClass('error');
				$('.coupon-errors').text('Invalid Coupon.');
				Session.set('validCoupon', false);
			} else {
				if (cardValidation() && accountForm.indexOf(false) === -1 && Session.get('validCoupon')) {
					$('.js-saving').show();
					$('.js-submit').prop('disabled', true);
					Meteor.call('insertGroup', user.email, function(error, groupId) {
						if (error) {
							Alerts.insert({
								colorClass: 'bg-danger',
								iconClass: 'icn-danger',
								message: error.reason,
							});
							
							$('.js-saving').hide();
							$('.js-submit').prop('disabled', false);
						} else {
							user.info.groupId = groupId;
							subscriptionProperties.customer.metadata.groupId = groupId;
							
							Accounts.createUser(user, function(error) {
								if (error) {
									console.log(error);
								}
								if (error && error.reason != 'unverified') {
									Alerts.insert({
										colorClass: 'bg-danger',
										iconClass: 'icn-danger',
										message: error.reason,
									});
							
									$('.js-saving').hide();
									$('.js-submit').prop('disabled', false);
								} else { 
									stripe.createToken(
										Session.get('cardNumber')
									).then((result) => {
										if (result.error) {
											let groupProperties = {
												_id: groupId,
												subscriptionStatus: 'error',
												subscriptionErrorMessage: result.error.message,
											};
											
											Meteor.call('updateGroup', groupProperties, function(error) {
												if (error) {
													FlowRouter.go('/verify/sent');
													Alerts.insert({
														colorClass: 'bg-danger',
														iconClass: 'icn-danger',
														message: error,
													});
												} else {
													Meteor.call('sendThankYouEmail', user, function() {
														FlowRouter.go('/verify/sent');
													});
												}
											});
										} else {
											subscriptionProperties.customer.source = result.token.id;
											Meteor.call('createSubscription', groupId, result.token.card.id, subscriptionProperties, function(error, updatedGroupProperties) {
												if (error) {
													console.log(error);
												}
												if (error) {
													Alerts.insert({
														colorClass: 'bg-danger',
														iconClass: 'icn-danger',
														message: error.reason,
													});
							
													$('.js-saving').hide();
													$('.js-submit').prop('disabled', false);
												} else {
													Meteor.call('sendThankYouEmail', user, function() {
														FlowRouter.go('/verify/sent');
													});
												}
											});
										}
									}).catch((error) => {
										Alerts.insert({
											colorClass: 'bg-danger',
											iconClass: 'icn-danger',
											message: error.message,
										});
				
										$('.js-saving').hide();
										$('.js-submit').prop('disabled', false);
									});
								}
							});
						}
					});

					return false;
				}
			}
		})

	},
});