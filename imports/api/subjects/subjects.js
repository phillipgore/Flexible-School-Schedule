import {Mongo} from 'meteor/mongo';
import SimpleSchema from 'simpl-schema';

export const Subjects = new Mongo.Collection('subjects');

Subjects.allow({
  insert: () => false,
  update: () => false,
  remove: () => false
});

Subjects.deny({
  insert: () => true,
  update: () => true,
  remove: () => true
});

const SubjectsSchema = new SimpleSchema({
	name: {
        type: String,
        label: "Subjects Name",
    },
    studentId: {
        type: String,
        label: "Student ID"
    },
    schoolYearId: {
        type: String,
        label: "School Year ID"
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

Subjects.attachSchema(SubjectsSchema);