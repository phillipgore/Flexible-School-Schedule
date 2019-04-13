import {Mongo} from 'meteor/mongo';
import SimpleSchema from 'simpl-schema';

export const Groups = new Mongo.Collection('groups');

Groups.allow({
  insert: () => false,
  update: () => false,
  remove: () => false
});

Groups.deny({
  insert: () => true,
  update: () => true,
  remove: () => true
});

const GroupsSchema = new SimpleSchema({
	stripeCustomerId: {
        type: String,
        label: "Stripe Customer ID",
        optional: true
    },
    stripeSubscriptionId: {
        type: String,
        label: "Stripe Subscription ID",
        optional: true
    },
    stripeCardId: {
        type: String,
        label: "Stripe Card ID",
        optional: true
    },
    stripePaymentAttempt: {
        type: Number,
        label: "Stripe Payment Attempt",
        optional: true
    },
    stripeCouponCodes: {
        type: Array,
        label: "Stripe Coupon Codes",
        optional: true
    },
    'stripeCouponCodes.$': {
        type: String,
        label: "Stripe Coupon Code",
    },
    stripeCurrentCouponCode: {
        type: Object,
        label: "Current Coupon Code",
        optional: true
    },
    'stripeCurrentCouponCode.id': {
        type: String,
        label: "Current Coupon ID",
        optional: true
    },
    'stripeCurrentCouponCode.startDate': {
        type: Number,
        label: "Current Coupon Start Date",
        optional: true
    },
    'stripeCurrentCouponCode.endDate': {
        type: Number,
        label: "Current Coupon End Date",
        optional: true
    },
    'stripeCurrentCouponCode.id': {
        type: String,
        label: "Current Coupon ID",
        optional: true
    },
    'stripeCurrentCouponCode.amountOff': {
        type: Number,
        label: "Current Coupon Amount Off (Pennies)",
        optional: true
    },
    'stripeCurrentCouponCode.percentOff': {
        type: Number,
        label: "Current Coupon Percent Off",
        optional: true
    },
	subscriptionStatus: {
		type: String,
		label: "Account Status",
        optional: true
	},
    subscriptionPausedOn: {
        type: Date,
        label: "Account Paused On Date",
        optional: true
    },
	subscriptionErrorMessage: {
        type: String,
        label: "Subscription Error Message",
        optional: true
    },
    freeTrial: {
        type: Object,
        label: "Free Trial",
        optional: true
    },
    'freeTrial.expiration': {
        type: Date,
        label: "Free Trial Expiration Date",
        optional: true
    },
    'freeTrial.initialPassword': {
        type: String,
        label: "Free Trial Initial Password",
        optional: true
    },
    appAdmin: {
        type: Boolean,
        label: "Application Admin Group",
        defaultValue: false,
    },
    testData: {
        type: Boolean,
        label: "Test Data",
        defaultValue: false,
    },
    initialIds: {
        type: Object,
        label: "Initial Ids",
        optional: false
    },
    'initialIds.studentId': {
        type: String,
        label: "Initial Student Id",
        optional: false,
        autoValue: function() {
            if ( !this.isSet ) {
                return 'empty';
            }
        }
    },
    'initialIds.schoolYearId': {
        type: String,
        label: "Initial School Year Id",
        optional: false,
        autoValue: function() {
            if ( !this.isSet ) {
                return 'empty';
            }
        }
    },
    'initialIds.resourceId': {
        type: String,
        label: "Initial Resource Id",
        optional: false,
        autoValue: function() {
            if ( !this.isSet ) {
                return 'empty';
            }
        }
    },
    'initialIds.resourceType': {
        type: String,
        label: "Initial Resource Type Id",
        optional: false,
        autoValue: function() {
            if ( !this.isSet ) {
                return 'empty';
            }
        }
    },
    'initialIds.termId': {
        type: String,
        label: "Initial Term Id",
        optional: false,
        autoValue: function() {
            if ( !this.isSet ) {
                return 'empty';
            }
        }
    },
    'initialIds.weekId': {
        type: String,
        label: "Initial Week Id",
        optional: false,
        autoValue: function() {
            if ( !this.isSet ) {
                return 'empty';
            }
        }
    },
    'initialIds.schoolWorkId': {
        type: String,
        label: "Initial School Work Id",
        optional: false,
        autoValue: function() {
            if ( !this.isSet ) {
                return 'empty';
            }
        }
    },
    'initialIds.userId': {
        type: String,
        label: "Initial User Id",
        optional: false,
        autoValue: function() {
            if ( !this.isSet ) {
                return 'empty';
            }
        }
    },
    'initialIds.reportId': {
        type: String,
        label: "Initial Report Id",
        optional: false,
        autoValue: function() {
            if ( !this.isSet ) {
                return 'empty';
            }
        }
    },
	createdOn: {
		type: Date,
		label: "Created On Date",
		autoValue: function() {
			if ( this.isInsert ) {
				return new Date();
			}
		}
	},
	updatedOn: {
		type: Date,
		label: "Updated On Date",
		optional: true,
		autoValue: function() {
			if ( this.isUpdate ) {
				return new Date();
			}
		}
	}
});

Groups.attachSchema(GroupsSchema);