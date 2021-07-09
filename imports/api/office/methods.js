import {Groups} from '../groups/groups.js';
import {Students} from '../students/students.js';
import {SchoolYears} from '../schoolYears/schoolYears.js';
import {Terms} from '../terms/terms.js';
import {Weeks} from '../weeks/weeks.js';

import {primaryInitialIds} from '../../modules/server/initialIds';
import {resourcesInitialIds} from '../../modules/server/initialIds';
import {usersInitialId} from '../../modules/server/initialIds';
import {reportsInitialId} from '../../modules/server/initialIds';
import {groupsInitialId} from '../../modules/server/initialIds';

import {upsertPaths} from '../../modules/server/paths';
import {upsertSchoolWorkPaths} from '../../modules/server/paths';

import {upsertStats} from '../../modules/server/stats';

Meteor.methods({
	runAppAdminInitialId: function() {
		let appAdminId = Groups.findOne({appAdmin: true})._id
		groupsInitialId(appAdminId);
	},

	runGroupInitialIds: function(groupId) {
		primaryInitialIds(groupId);
		resourcesInitialIds(groupId);
		usersInitialId(groupId);
		reportsInitialId(groupId);
	},

	runGroupPaths: function(groupId) {
		let pathProperties = {
			studentIds: Students.find({groupId: groupId}).map(student => student._id),
			schoolYearIds: SchoolYears.find({groupId: groupId}).map(schoolYear => schoolYear._id),
			termIds: Terms.find({groupId: groupId}).map(term => term._id),
		}

		upsertPaths(pathProperties, false, groupId);
		upsertSchoolWorkPaths(pathProperties, groupId);
	},

	runGroupStats: function(groupId) {
		let statProperties = {
			studentIds: Students.find({groupId: groupId}).map(student => student._id),
			schoolYearIds: SchoolYears.find({groupId: groupId}).map(schoolYear => schoolYear._id),
			termIds: Terms.find({groupId: groupId}).map(term => term._id),
			weekIds: Weeks.find({groupId: groupId}).map(week => week._id),
		}
		
		upsertStats(statProperties, groupId);
	}
});