import {Questions} from './questions.js';
import _ from 'lodash';

Meteor.methods({
	insertQuestion(questionProperties) {
		const questionId = Questions.insert(questionProperties);
		return questionId;
	},

	updateQuestion(questionProperties) {
		Questions.update(questionProperties._id, {$set: questionProperties});
	},

	batchUpdateQuestions: function(batchQuestionProperties) {
		batchQuestionProperties.forEach(function(question, index) {
			Questions.update(question._id, {$set: question});
		});
	},

	deleteQuestion(questionId) {
		Questions.remove({_id: questionId});
	},

	getInitialQuestionId: function() {
		let initialQuestion = Questions.findOne({}, {sort: {order: 1, question: 1}});
		if (initialQuestion) {
			return initialQuestion._id
		}
		return 'empty';
	}
})