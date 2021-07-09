import {Notes} from './notes.js';

Meteor.methods({
	upsertNotes: function(noteProperties) {
		Notes.update({weekId: noteProperties.weekId, schoolWorkId: noteProperties.schoolWorkId}, {$set: noteProperties}, {upsert: true});
	},

	getNoteInfo: function(weekId, schoolWorkId) {
		let groupId = Meteor.users.findOne({_id: this.userId}).info.groupId;

		return Notes.findOne({groupId: groupId, weekId: weekId, schoolWorkId: schoolWorkId, note: {$exists: true}}, {fields: {schoolWorkId: 1, note: 1}});
	},
});