import {Mongo} from 'meteor/mongo';
import SimpleSchema from 'simpl-schema';

export const Lessons = new Mongo.Collection('lessons');

Lessons.deny({
	insert() {return true; },
	update() {return true; },
	remove() {return true; },
});

const LessonsSchema = new SimpleSchema({
	completed: {
		type: Boolean,
		defaultValue: false,
	},
	completedOn: {
        type: Date,
        label: "Completed On"
    },
    completionTime: {
        type: Number,
        label: "Completion Time",
    },
    description: {
        type: String,
        label: "Description",
        optional: true
    },
	archived: {
		type: Boolean,
		defaultValue: false,
	},
    subjectId: {
        type: String,
        label: "Subject ID"
    },
    studentId: {
        type: String,
        label: "Student ID"
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
	}
});

Lessons.attachSchema(LessonsSchema);