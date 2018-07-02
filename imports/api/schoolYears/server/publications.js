import {SchoolYears} from '../schoolYears.js';
import {Students} from '../../students/students.js';
import {Terms} from '../../terms/terms.js';
import {Weeks} from '../../weeks/weeks.js';
import {Subjects} from '../../subjects/subjects.js';
import {Resources} from '../../resources/resources.js';
import {Lessons} from '../../lessons/lessons.js';
import {allSchoolYearsStatusAndPaths} from '../../../modules/server/functions';
import {studentSchoolYearsStatusAndPaths} from '../../../modules/server/functions';
import _ from 'lodash'

Meteor.publish('allSchoolYears', function() {
	if (!this.userId) {
		return this.ready();
	}

	let groupId = Meteor.users.findOne({_id: this.userId}).info.groupId;
	return SchoolYears.find({groupId: groupId, deletedOn: { $exists: false }}, {sort: {startYear: 1}, fields: {startYear: 1, endYear: 1}});
});

Meteor.publish('allSchoolYearsPath', function() {
	this.autorun(function (computation) {
		if (!this.userId) {
			return this.ready();
		}

		let self = this;

		let groupId = Meteor.users.findOne({_id: this.userId}).info.groupId;

		// Terms.find({groupId: groupId});
		// Weeks.find({groupId: groupId});
		// Lessons.find({groupId: groupId});

		let schoolYears = SchoolYears.find({groupId: groupId, deletedOn: { $exists: false }}, {sort: {startYear: 1}, fields: {startYear: 1, endYear: 1}});

		schoolYears.map((schoolYear) => {
			schoolYear = allSchoolYearsStatusAndPaths(schoolYear, schoolYear._id);
			self.added('schoolYears', schoolYear._id, schoolYear);
		});

		self.ready();
	});
});

Meteor.publish('studentSchoolYearsPath', function(studentId) {
	this.autorun(function (computation) {
		if (!this.userId) {
			return this.ready();
		}

		let self = this;

		let groupId = Meteor.users.findOne({_id: this.userId}).info.groupId;

		// Terms.find({groupId: groupId});
		// Weeks.find({groupId: groupId});
		// Lessons.find({groupId: groupId});

		let schoolYears = SchoolYears.find({groupId: groupId, deletedOn: { $exists: false }}, {sort: {startYear: 1}, fields: {startYear: 1, endYear: 1}});

		schoolYears.map((schoolYear) => {
			schoolYear = studentSchoolYearsStatusAndPaths(schoolYear, schoolYear._id, studentId);
			self.added('schoolYears', schoolYear._id, schoolYear);
		});

		self.ready();
	});
});

Meteor.publish('schoolYearView', function(schoolYearId) {
	this.autorun(function (computation) {
		if (!this.userId) {
			return this.ready();
		}

		let self = this;

		let groupId = Meteor.users.findOne({_id: this.userId}).info.groupId;
		let schoolYear = SchoolYears.findOne({groupId: groupId, deletedOn: { $exists: false }, _id: schoolYearId});
		let terms = Terms.find({groupId: groupId, deletedOn: { $exists: false }, schoolYearId: schoolYearId});

		termStats = []

		terms.forEach((term) => {
			let weekCount = Weeks.find({groupId: groupId, deletedOn: { $exists: false }, termId: term._id}).count();
			if (!_.find(termStats, { 'termOrder': term.order, 'weekCount': weekCount })) {
				termStats.push({termOrder: term.order, weekCount: weekCount})
			}	
		})

		if (schoolYear) {
			schoolYear.termStats = _.uniq(termStats);
			self.added('schoolYears', schoolYear._id, schoolYear);
		}

		self.ready();
	});
});

Meteor.publish('schoolYearComplete', function(schoolYearId) {
	if (!this.userId) {
		return this.ready();
	}

	let groupId = Meteor.users.findOne({_id: this.userId}).info.groupId;
	let termIds = Terms.find({groupId: groupId, deletedOn: { $exists: false }, schoolYearId: schoolYearId}).map(term => term._id);
	let weekIds = Weeks.find({groupId: groupId, deletedOn: { $exists: false }, termId: {$in: termIds}}).map(week => week._id);

	return [
		SchoolYears.find({groupId: groupId, deletedOn: { $exists: false }, _id: schoolYearId}),
		Terms.find({groupId: groupId, deletedOn: { $exists: false }, schoolYearId: schoolYearId}, {sort: {order: 1}}),
		Subjects.find(
			{groupId: groupId, deletedOn: { $exists: false }, schoolYearId: schoolYearId}, 
			{sort: {order: 1}, fields: {schoolYearId: 1, name: 1}}
		),
		Weeks.find({groupId: groupId, deletedOn: { $exists: false }, termId: {$in: termIds}}, {sort: {order: 1}}),
		Lessons.find({groupId: groupId, deletedOn: { $exists: false }, weekId: {$in: weekIds}}, {sort: {order: 1}}),
	];
});









