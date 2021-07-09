import {primaryInitialIds} from '../../modules/server/initialIds';
import {upsertPaths} from '../../modules/server/paths';
import {upsertSchoolWorkPaths} from '../../modules/server/paths';
import {upsertStats} from '../../modules/server/stats';

Meteor.methods({
	runUpsertPaths: function(pathProperties, returnPath) {
		let result = upsertPaths(pathProperties, returnPath);
		return result;
	},

	runUpsertSchoolWorkPaths: function(pathProperties) {
		upsertPaths(pathProperties);
		upsertSchoolWorkPaths(pathProperties);
		primaryInitialIds();
	},

	runUpsertSchoolWorkPathsAndStats: function(pathProperties, statProperties) {
		upsertPaths(pathProperties);
		upsertSchoolWorkPaths(pathProperties);
		primaryInitialIds();
		upsertStats(statProperties);
	},
});