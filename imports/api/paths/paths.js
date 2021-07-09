import {Mongo} from 'meteor/mongo';
import SimpleSchema from 'simpl-schema';

export const Paths = new Mongo.Collection('paths');

Paths.allow({
  insert: () => false,
  update: () => false,
  remove: () => false
});

Paths.deny({
  insert: () => true,
  update: () => true,
  remove: () => true
});

const PathsSchema = new SimpleSchema({
	studentId: {
		type: String,
		label: "Student ID"
	},
	timeFrameId: {
		type: String,
		label: "Time Frame ID"
	},
	type: {
		type: String,
		label: "Type",
		allowedValues: ['schoolYear', 'term'],
	},
	firstTermId: {
		type: String,
		label: "First Term ID",
        optional: true,
	},
	firstWeekId: {
		type: String,
		label: "First Week ID",
        optional: true,
	},
	firstSchoolWorkId: {
		type: String,
		label: "First School Work ID",
        optional: true,
	},
	firstSchoolWorkType: {
		type: String,
		label: "First School Work Type",
        optional: true,
	},
	
	groupId: {
		type: String,
		label: "Group ID",
		// autoValue: function() {
		// 	if ( this.isInsert ) {
		// 		return Meteor.user().info.groupId;
		// 	}
		// }
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
});

Paths.attachSchema(PathsSchema);






