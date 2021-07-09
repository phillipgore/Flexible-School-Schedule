import {Reports} from './reports.js';
import {reportsInitialId} from '../../modules/server/initialIds';

Meteor.methods({
	insertReport(reportProperties) {
		const reportId = Reports.insert(reportProperties);
		reportsInitialId();
		return reportId;
	},

	updateReport: function(reportId, reportProperties) {
		Reports.update(reportId, {$set: reportProperties}, function(error, result) {
			if (error) {
				console.log(error)
			} else {
				reportsInitialId();
			}
		});
	},

	deleteReport: function(reportId) {
		Reports.remove({_id: reportId}, function(error, result) {
			if (error) {
				console.log(error)
			} else {
				reportsInitialId();
			}
		});
	},
});
