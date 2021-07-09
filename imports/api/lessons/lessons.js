import {Mongo} from 'meteor/mongo';
import SimpleSchema from 'simpl-schema';

export const Lessons = new Mongo.Collection('lessons');

Lessons.allow({
  insert: () => false,
  update: () => false,
  remove: () => false
});

Lessons.deny({
  insert: () => true,
  update: () => true,
  remove: () => true
});

const LessonsSchema = new SimpleSchema({
	order: {
        type: Number,
        label: "Order",
    },
    weekDay: {
        type: Number,
        label: "Week Day",
        allowedValues: [0, 1, 2, 3, 4, 5, 6, 7],
        optional: true
    },
    weekDayEdited: {
        type: Boolean,
        label: "Week Day Edited",
        defaultValue: false
    },
    weekOrder: {
        type: Number,
        label: "Week Order"
    },
    termOrder: {
        type: Number,
        label: "Term Order"
    },
    assigned: {
    	type: Boolean,
		label: "Assigned",
		defaultValue: false,
    },
	completed: {
		type: Boolean,
		label: "Completed",
		defaultValue: false,
	},
	completedOn: {
        type: Date,
        label: "Completed On",
        optional: true
    },
    completionTime: {
        type: Number,
        label: "Completion Time",
        optional: true
    },
    description: {
        type: String,
        label: "Description",
        optional: true
    },
    schoolWorkId: {
        type: String,
        label: "School Work ID"
    },
    schoolYearId: {
        type: String,
        label: "School Year ID"
    },
    termId: {
        type: String,
        label: "Term ID"
    },
    weekId: {
        type: String,
        label: "Week ID"
    },
    studentId: {
        type: String,
        label: "Student ID"
    },
    subjectId: {
        type: String,
        label: "Subject ID",
        optional: true
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

Lessons.attachSchema(LessonsSchema);