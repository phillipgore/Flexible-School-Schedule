import {Subjects} from './subjects.js';
import {SchoolWork} from '../schoolWork/schoolWork.js';
import {Lessons} from '../lessons/lessons.js';

import _ from 'lodash'

Meteor.methods({
    insertSubject: function(subjectProperties) {
        const subjectId = Subjects.insert(subjectProperties);
        return subjectId;
    },

    updateSubject: function(subjectProperties) {
        Subjects.update(subjectProperties._id, {$set: subjectProperties});
    },

    deleteSubject: function(subjectId) {
        let schoolWorkIds = SchoolWork.find({subjectId: subjectId}).map(lesson => (lesson._id));
        let lessonIds = Lessons.find({subjectId: subjectId}).map(lesson => (lesson._id));

		Subjects.remove({_id: subjectId});
		SchoolWork.remove({_id: {$in: schoolWorkIds}});
		Lessons.remove({_id: {$in: lessonIds}});
	},
});