import {Lessons} from './lessons.js';
import {Notes} from '../notes/notes.js';
import {upsertPaths} from '../../modules/server/paths';
import {upsertStats} from '../../modules/server/stats';
import {primaryInitialIds} from '../../modules/server/initialIds';

import _ from 'lodash';


Meteor.methods({
	getLesson(lessonId) {
		if (!this.userId) {
			return false;
		}

		let groupId = Meteor.users.findOne({_id: this.userId}).info.groupId;
		return Lessons.findOne({_id: lessonId, groupId: groupId}, {fields: {groupId: 0, userId: 0, createdOn: 0, updatedOn: 0}});
	},

	bulkLabelUpdateLessons: function(bulkLessonProperties) {
		let result = Lessons.rawCollection().bulkWrite(
			bulkLessonProperties
		).then((result) => {
			return result;
		}).catch((error) => {
			throw new Meteor.Error(500, error);
		});
		return result;
	},

	bulkInsertLessons: function(bulkInsertLessonProperties, bulkUpdateLessonProperties) {
		let result = Lessons.rawCollection().bulkWrite(
			bulkInsertLessonProperties
		).then((result) => {
			if (bulkUpdateLessonProperties.length) {
				return Lessons.rawCollection().bulkWrite(bulkUpdateLessonProperties)
			}
			return [];
		}).then((result) => {
			return true;
		}).catch((error) => {
			throw new Meteor.Error(500, error);
		});
		return true;
	},

	updateLesson: function(statProperties, pathProperties, lessonProperties) {
		Lessons.update(lessonProperties._id, {$set: lessonProperties}, function() {
			upsertPaths(pathProperties);
			upsertStats(statProperties);
			primaryInitialIds();
		});
	},

	batchUpdateLessons: function(batchLessonProperties, notesProperties) {
		if (batchLessonProperties.length) {
			batchLessonProperties.forEach((lessonProperties) => {
				Lessons.update(lessonProperties._id, {$set: lessonProperties});
			});
		}

		if (notesProperties.length) {
			notesProperties.forEach(note => {
				Notes.insert(note)
			});
		}
	},

	bulkWriteLessons: function(bulkLessonProperties) {
		Lessons.rawCollection().bulkWrite(bulkLessonProperties)
	},

	deleteLessons: function(lessonIds, noteIds) {
		Lessons.remove({_id: {$in: lessonIds}});
		if (noteIds.length) {
			Notes.remove({_id: {$in: noteIds}});
		}
	},

	runUpsertLessonPathsAndStats: function(statProperties, pathProperties) {
		upsertPaths(pathProperties);
		upsertSchoolWorkPaths(pathProperties);
		primaryInitialIds();
		upsertStats(statProperties);
	},




	/* ------------------------------ Track Edit Page ------------------------------ */

	batchMoveLessonsToExistingWeek: function(batchCheckedLessonProperties, batchUncheckedLessonProperties, notesProperties, notePlacement) {
		let groupId = Meteor.users.findOne({_id: this.userId}).info.groupId;
		let schoolWorkIds = _.uniq(batchCheckedLessonProperties.map(lesson => lesson.schoolWorkId));
		let existingLessons = Lessons.find({weekId: batchCheckedLessonProperties[0].weekId, schoolWorkId: {$in: schoolWorkIds}}, {fields: {termId: 1, weekId: 1, schoolWorkId: 1, order: 1, weekOrder: 1, termOrder: 1, completed: 1}}).fetch();
		let concatLessons = batchCheckedLessonProperties.concat(existingLessons)
		let reorderedLessonsProperties = [];

		schoolWorkIds.forEach(workId => {
			let lessons = _.filter(concatLessons, {'schoolWorkId': workId});
			let reorderedLessons = _.orderBy(lessons, ['completed', 'order'], ['desc', 'asc'])
			reorderedLessons.forEach((reorderedLesson, index) => {
				reorderedLesson.order = index + 1;
				reorderedLessonsProperties.push(reorderedLesson);
			})
		});

		let batchUpdateLessonsProperties = reorderedLessonsProperties.concat(batchUncheckedLessonProperties);

		batchUpdateLessonsProperties.forEach((updateLessonsProperties) => {
			Lessons.update(updateLessonsProperties._id, {$set: updateLessonsProperties});
		});

		if (notesProperties.length) {
			let updatedNoteProperties = [];
			let existingNotes = Notes.find({schoolWorkId: {$in: schoolWorkIds}, weekId: batchCheckedLessonProperties[0].weekId}).fetch();

			if (existingNotes.length) {
				notesProperties.forEach(note => {
					let existingNote = _.find(existingNotes, {schoolWorkId: note.schoolWorkId, weekId: note.weekId});

					if (notePlacement === 'append') {
						let updatedNote = note.note + existingNote.note;
						updatedNoteProperties.push({schoolWorkId: existingNote.schoolWorkId, weekId: existingNote.weekId, note: updatedNote});
					} else {
						let updatedNote = existingNote.note + note.note;
						updatedNoteProperties.push({schoolWorkId: existingNote.schoolWorkId, weekId: existingNote.weekId, note: updatedNote});
					}
				})
			} else {
				notesProperties.forEach(note => {
					updatedNoteProperties.push(note);
				});
			}

			updatedNoteProperties.forEach(noteProperties => {
				Notes.update({groupId: groupId, userId: Meteor.userId(), schoolWorkId: noteProperties.schoolWorkId, weekId: noteProperties.weekId}, {$set: noteProperties}, {upsert: true})
			});
		}
	},
});

