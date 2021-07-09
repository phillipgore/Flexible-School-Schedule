import {Groups} from '../../../api/groups/groups.js';
import {Students} from '../../../api/students/students.js';
import {SchoolYears} from '../../../api/schoolYears/schoolYears.js';
import {Terms} from '../../../api/terms/terms.js';
import {Weeks} from '../../../api/weeks/weeks.js';
import {Resources} from '../../../api/resources/resources.js';
import {Subjects} from '../../../api/subjects/subjects.js';
import {SchoolWork} from '../../../api/schoolWork/schoolWork.js';
import {Lessons} from '../../../api/lessons/lessons.js';
import {Paths} from '../../../api/paths/paths.js';
import {Stats} from '../../../api/stats/stats.js';

import {primaryInitialIds, resourcesInitialIds, usersInitialId, reportsInitialId, groupsInitialId} from '../../../modules/server/initialIds';
import {upsertPaths, upsertSchoolWorkPaths} from '../../../modules/server/paths';
import {upsertStats} from '../../../modules/server/stats';

Meteor.methods({
	removeFixtureData() {
		let groupId = Meteor.users.findOne({_id: this.userId}).info.groupId;

		if (!Groups.findOne({_id: groupId}).appAdmin) {
			throw new Meteor.Error('no-role-app', 'You do not have permission to add test data.');
		}

		Lessons.remove({groupId: groupId});
		SchoolWork.remove({groupId: groupId});
		Subjects.remove({groupId: groupId});
		Weeks.remove({groupId: groupId});
		Terms.remove({groupId: groupId});
		SchoolYears.remove({groupId: groupId});
		Students.remove({groupId: groupId});
		Resources.remove({groupId: groupId});
		Paths.remove({groupId: groupId});
		Stats.remove({groupId: groupId});
		
		Groups.update(groupId, {$set: {
			fixtureData: {
				hasStudentData: false,
				hasSchoolYearData: false,
				hasResourceData: false,
				hasSchoolWorkData: false,
				hasLessonData: false,
			}
		}});

		let pathProperties = {
			studentIds: Students.find({groupId: groupId}).map(student => student._id),
			schoolYearIds: SchoolYears.find({groupId: groupId}).map(schoolYear => schoolYear._id),
			termIds: Terms.find({groupId: groupId}).map(term => term._id),
		}

		upsertPaths(pathProperties, false, groupId);
		upsertSchoolWorkPaths(pathProperties, groupId);

		let statProperties = {
			studentIds: Students.find({groupId: groupId}).map(student => student._id),
			schoolYearIds: SchoolYears.find({groupId: groupId}).map(schoolYear => schoolYear._id),
			termIds: Terms.find({groupId: groupId}).map(term => term._id),
			weekIds: Weeks.find({groupId: groupId}).map(week => week._id),
		}
		
		upsertStats(statProperties, groupId);
		
		primaryInitialIds(groupId);
		resourcesInitialIds(groupId);
		usersInitialId(groupId);
		reportsInitialId(groupId);
		groupsInitialId(groupId);

		return Groups.findOne({_id: groupId}).initialIds;
	}
});