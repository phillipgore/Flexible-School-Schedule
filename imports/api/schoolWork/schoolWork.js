import {Mongo} from 'meteor/mongo';
import SimpleSchema from 'simpl-schema';

export const SchoolWork = new Mongo.Collection('schoolWork');

SchoolWork.allow({
  insert: () => false,
  update: () => false,
  remove: () => false
});

SchoolWork.deny({
  insert: () => true,
  update: () => true,
  remove: () => true
});

const SchoolWorkSchema = new SimpleSchema({
	order: {
        type: Number,
        label: "Order",
        optional: true
    },
    name: {
        type: String,
        label: "SchoolWork Name",
    },
    description: {
        type: String,
        label: "Description",
        optional: true
    },
    resources: {
        type: Array,
        label: "Attached Resources",
		optional: true
    },
	'resources.$': {
		type: String,
        label: "Attached Resource",
	},
    studentId: {
        type: String,
        label: "Student ID"
    },
    schoolYearId: {
        type: String,
        label: "School Year ID"
    },
    subjectId: {
        type: String,
        label: "Subject ID",
        optional: true
    },
    scheduledDays: {
    	type: Array,
    	label: "Scheduled Days of the Week"
    },
    'scheduledDays.$': {
    	type: Object,
    	label: "Scheduled Days of the Week"
    },
    'scheduledDays.$.segmentCount': {
    	type: Number,
    	label: "Number of Segments"
    },
    'scheduledDays.$.days': {
    	type: Array,
    	label: "Scheduled Days of the Week"
    },
    'scheduledDays.$.days.$': {
    	type: Number,
    	label: "Scheduled Days of the Week"
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

SchoolWork.attachSchema(SchoolWorkSchema);