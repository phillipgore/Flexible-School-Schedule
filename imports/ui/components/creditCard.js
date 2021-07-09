import {Template} from 'meteor/templating';
import './creditCard.html';

import moment from 'moment';
import _ from 'lodash';
import Stripe from '../../modules/stripe';

Template.creditCard.onCreated( function() {
	Session.set('validCoupon', true);
});

Template.creditCard.onRendered( function() {
	Session.set({
		cardNumber: 'none',
		cardCvc: 'none',
		cardExpiry: 'none',
		postalCode: 'none',
	});

	Stripe((stripe) => {
		let elements = stripe.elements();

		let style = {
			base: {
				color: '#32325d',
				fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
				fontSmoothing: 'antialiased',
				fontSize: '16px',
				'::placeholder': {
					color: '#D7D9D9',
					fontStyle: 'italic'
				}
			},
			invalid: {
				color: '#E06B6B',
				iconColor: '#E06B6B'
			}
		};

		let cardNumber = elements.create('cardNumber', {style: style, placeholder: 'Card Number'});
		let cardCvc = elements.create('cardCvc', {style: style, placeholder: 'CVC'});
		let cardExpiry = elements.create('cardExpiry', {style: style});
		let postalCode = elements.create('postalCode', {style: style, placeholder: 'Postal Code'})

		cardNumber.mount('#card-number');
		cardCvc.mount('#card-cvc');
		cardExpiry.mount('#card-expiry');
		postalCode.mount('#card-postal-code');

		cardNumber.addEventListener('change', ({ error }) => {
			if (error) {
				$('.card-number-errors').text(error.message);
			} else {
				$('.card-number-errors').text('');
			}
			
			if (!cardNumber) {
				Session.set('cardNumber', 'none');
			}
			Session.set('cardNumber', cardNumber);
		});

		cardCvc.addEventListener('change', ({ error }) => {
			if (error) {
				$('.card-cvc-errors').text('Invalid.');
			} else {
				$('.card-cvc-errors').text('');
			}

			if (!cardCvc) {
				Session.set('cardNumber', 'none');
			}
			Session.set('cardCvc', cardCvc);
		});

		cardExpiry.addEventListener('change', ({ error }) => {
			if (error) {
				$('.card-expiry-errors').text(error.message);
			} else {
				$('.card-expiry-errors').text('');
			}

			if (!cardExpiry) {
				Session.set('cardNumber', 'none');
			}
			Session.set('cardExpiry', cardExpiry);
		});

		postalCode.addEventListener('change', ({ error }) => {
			if (error) {
				$('.card-postal-codde-errors').text(error.message);
			} else {
				$('.card-postal-codde-errors').text('');
			}
			
			if (!postalCode) {
				Session.set('cardNumber', 'none');
			}
			Session.set('postalCode', postalCode);
		});
	});
});

Template.creditCard.helpers({
	months: [
		{label: '01', value: 1},
		{label: '02', value: 2},
		{label: '03', value: 3},
		{label: '04', value: 4},
		{label: '05', value: 5},
		{label: '06', value: 6},
		{label: '07', value: 7},
		{label: '08', value: 8},
		{label: '09', value: 9},
		{label: '10', value: 10},
		{label: '11', value: 11},
		{label: '12', value: 12},
	],

	years: function() {
		let thisYear = moment().year();
		let yearArray = []
		for (i = 0; i < 10; i++) { 
		    yearArray.push({year: thisYear + i});
		}
		return yearArray;
	},

	hideCoupon: function() {
		return Session.get('hideCoupon');
	}
});

Template.creditCard.events({
	'keyup #coupon, blur #coupon'(event) {
		let instance = Template.instance();

		if (instance.debounce) {
			Meteor.clearTimeout(instance.debounce);
		}

		instance.debounce = Meteor.setTimeout(function() {
			Meteor.call('getCoupon', event.currentTarget.value.trim().toLowerCase(), function(error, result) {
				if (error && event.currentTarget.value.trim().length != 0) {
					$('#coupon').addClass('error');
					$('.coupon-errors').text('Invalid Coupon.');
					Session.set('validCoupon', false);
				} else {
					$('#coupon').removeClass('error');
					$('.coupon-errors').text('');

					Session.set('coupon', result);
					Session.set('validCoupon', true);
				}
			})
		}, 500);
	}
});










