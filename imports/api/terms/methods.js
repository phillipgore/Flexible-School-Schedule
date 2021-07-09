import {Terms} from './terms.js';

Meteor.methods({
	insertTerm(termProperties) {
		const termId = Terms.insert(termProperties);
		return termId;
	},

	updateTerm: function(termId, termProperties) {
		Terms.update(termId, {$set: termProperties});
	},

	batchUpdateTerms: function(termProperties) {
		termProperties.forEach(function(term, index) {
			Terms.update(term._id, {$set: term});
		});
	},

	batchRemoveTerms: function(termIds) {
		termIds.forEach(function(termId, index) {
			Terms.remove(termId);
		});
	},
})