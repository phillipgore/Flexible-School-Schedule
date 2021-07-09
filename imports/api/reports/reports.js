import {Mongo} from 'meteor/mongo';
import SimpleSchema from 'simpl-schema';

export const Reports = new Mongo.Collection('reports');

Reports.allow({
  insert: () => false,
  update: () => false,
  remove: () => false
});

Reports.deny({
  insert: () => true,
  update: () => true,
  remove: () => true
});

const ReportsSchema = new SimpleSchema({
    name: {
        type: String,
        label: "School Work Name",
    },
    weekEquals: {
        type: Number,
        label: "Week Equals Number of Days",
        optional: false
    },

    // School Years
    schoolYearReportVisible: {
		type: Boolean,
		label: "School Year Report",
		defaultValue: true,
	},
	schoolYearProgressVisible: {
		type: Boolean,
		label: "School Year Progress",
		defaultValue: true,
	},
	schoolYearStatsVisible: {
		type: Boolean,
		label: "School Year Stats",
		defaultValue: true,
	},
	schoolYearCompletedVisible: {
		type: Boolean,
		label: "School Year Progress Stats",
		defaultValue: true,
	},
	schoolYearTimesVisible: {
		type: Boolean,
		label: "School Year Times",
		defaultValue: true,
	},

	// Terms
	termsReportVisible: {
		type: Boolean,
		label: "Terms Report",
		defaultValue: false,
	},
	termsStatsVisible: {
		type: Boolean,
		label: "Terms Stats",
		defaultValue: true,
	},
	termsProgressVisible: {
		type: Boolean,
		label: "Terms Progress",
		defaultValue: true,
	},
	termsCompletedVisible: {
		type: Boolean,
		label: "School Year Progress Stats",
		defaultValue: true,
	},
	termsTimesVisible: {
		type: Boolean,
		label: "Terms Times",
		defaultValue: true,
	},
	
	// School Work
	schoolWorkReportVisible: {
		type: Boolean,
		label: "School Work Report",
		defaultValue: true,
	},

    // Subjects
    subjectReportVisible: {
		type: Boolean,
		label: "Subject Report",
		defaultValue: true,
	},
	subjectProgressVisible: {
		type: Boolean,
		label: "Subject Progress",
		defaultValue: true,
	},
	subjectStatsVisible: {
		type: Boolean,
		label: "Subject Stats",
		defaultValue: false,
	},
	subjectCompletedVisible: {
		type: Boolean,
		label: "Subject Progress Stats",
		defaultValue: false,
	},
	subjectTimesVisible: {
		type: Boolean,
		label: "SubjectTimes",
		defaultValue: false,
	},
	
	// Work
	workReportVisible: {
		type: Boolean,
		label: "Work Stats",
		defaultValue: true,
	},
	schoolWorkStatsVisible: {
		type: Boolean,
		label: "Work Stats",
		defaultValue: true,
	},
	schoolWorkProgressVisible: {
		type: Boolean,
		label: "Work Progress",
		defaultValue: true,
	},
	schoolWorkTimesVisible: {
		type: Boolean,
		label: "Work Times",
		defaultValue: true,
	},
	schoolWorkDescriptionVisible: {
		type: Boolean,
		label: "Work Description",
		defaultValue: true,
	},
	schoolWorkResourcesVisible: {
		type: Boolean,
		label: "Work Resources",
		defaultValue: true,
	},
	
	// Times Per Week
	timesPerWeekReportVisible: {
		type: Boolean,
		label: "Times Per Week Report",
		defaultValue: false,
	},
	timesPerWeekProgressVisible: {
		type: Boolean,
		label: "Times Per Week Progress",
		defaultValue: true,
	},

	// Resources
	resourcesReportVisible: {
		type: Boolean,
		label: "Resources Report",
		defaultValue: false,
	},
	resourcesOriginatorVisible: {
		type: Boolean,
		label: "Resources Originator",
		defaultValue: true,
	},
	resourcesPublicationVisible: {
		type: Boolean,
		label: "Resources Publication",
		defaultValue: true,
	},
	resourcesSchoolWorkVisible: {
		type: Boolean,
		label: "Resources School Work",
		defaultValue: true,
	},
	resourcesLinkVisible: {
		type: Boolean,
		label: "Resources Link",
		defaultValue: true,
	},
	resourcesDescriptionVisible: {
		type: Boolean,
		label: "Resources Description",
		defaultValue: false,
	},

	groupId: {
		type: String,
		label: "Group ID",
		autoValue: function() {
			if ( this.isInsert ) {
				return Meteor.user().info.groupId;
			}
		}
	},
	userId: {
		type: String,
		label: "User ID",
		autoValue: function() {
			if ( this.isInsert ) {
				return Meteor.userId();
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
	},
	deletedOn: {
		type: Date,
		label: "Deleted On Date",
        optional: true
	}
});

Reports.attachSchema(ReportsSchema);