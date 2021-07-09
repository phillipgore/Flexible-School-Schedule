import {Template} from 'meteor/templating';
import {Groups} from '../../../api/groups/groups.js';

import './testDataList.html';

Template.testDataList.onCreated( function() {
	// Subscriptions
	let template = Template.instance();
	template.studentDataCreating = new ReactiveVar(false);
	template.schoolYearDataCreating = new ReactiveVar(false);
	template.resourceDataCreating = new ReactiveVar(false);
	template.schoolWorkDataCreating = new ReactiveVar(false);
	template.lessonDataCreating = new ReactiveVar(false);
	template.dataRemoving = new ReactiveVar(false);

	this.subscribe('testDataStats');
});

Template.testDataList.helpers({
	totalDataCount: function() {
		return Counts.get('studentCount') + Counts.get('schoolYearCount') + Counts.get('resourceCount') + Counts.get('schoolWorkCount') + Counts.get('subjectCount') + Counts.get('lessonCount');
	},

	schoolWorkCount: function() {
		return Counts.get('schoolWorkCount') + Counts.get('subjectCount');
	},

	studentDataCreating: function() {
		return Template.instance().studentDataCreating.get();
	},

	schoolYearDataCreating: function() {
		return Template.instance().schoolYearDataCreating.get();
	},

	schoolWorkDataCreating: function() {
		return Template.instance().schoolWorkDataCreating.get();
	},

	resourceDataCreating: function() {
		return Template.instance().resourceDataCreating.get();
	},

	lessonDataCreating: function() {
		return Template.instance().lessonDataCreating.get();
	},

	dataRemoving: function() {
		return Template.instance().dataRemoving.get();
	},

	dataCreating: function() {
		if (Template.instance().studentDataCreating.get() || Template.instance().schoolYearDataCreating.get() || Template.instance().schoolWorkDataCreating.get() || Template.instance().resourceDataCreating.get() || Template.instance().lessonDataCreating.get()) {
			return true;
		}
		return false;
	},
});

Template.testDataList.events({
	'click .js-student-data '(event, template) {
		event.preventDefault();

		let studentDataCreating = template.studentDataCreating.get();
		let dataRemoving = template.dataRemoving.get();
		let studentCount = Counts.get('studentCount');

		if (studentDataCreating || dataRemoving) {return false;}

		if (studentCount) {
			Alerts.insert({
				colorClass: 'bg-danger',
				iconClass: 'icn-danger',
				message: `You already have ${studentCount} Students.`,
			});
		} else {
			template.studentDataCreating.set(true);
			Meteor.call('addStudentFixtures', function(error, result) {
				if (error) {
					template.studentDataCreating.set(false);
					Alerts.insert({
						colorClass: 'bg-danger',
						iconClass: 'icn-danger',
						message: error.reason,
					});
				} else {
					Session.set('selectedStudentId', result.studentId);
					template.studentDataCreating.set(false);
				}
			});
		}
	},

	'click .js-school-year-data '(event, template) {
		event.preventDefault();

		let schoolYearDataCreating = template.schoolYearDataCreating.get();
		let dataRemoving = template.dataRemoving.get();
		let schoolYearCount = Counts.get('schoolYearCount');

		if (schoolYearDataCreating || dataRemoving) {return false;}

		if (schoolYearCount) {
			Alerts.insert({
				colorClass: 'bg-danger',
				iconClass: 'icn-danger',
				message: `You already have ${schoolYearCount} School Years.`,
			});
		} else {
			template.schoolYearDataCreating.set(true);
			Meteor.call('addSchoolYearFixtures', function(error, result) {
				if (error) {
					template.schoolYearDataCreating.set(false);
					Alerts.insert({
						colorClass: 'bg-danger',
						iconClass: 'icn-danger',
						message: error.reason,
					});
				} else {
					Session.set('selectedSchoolYearId', result.schoolYearId);
					Session.set('selectedTermId', result.termId);
					Session.set('selectedWeekId', result.weekId);
					template.schoolYearDataCreating.set(false);
				}
			});
		}
	},

	'click .js-resource-data '(event, template) {
		event.preventDefault();

		let resourceDataCreating = template.resourceDataCreating.get();
		let dataRemoving = template.dataRemoving.get();
		let resourceCount = Counts.get('resourceCount');
		
		if (resourceDataCreating || dataRemoving) {return false;}

		if (resourceCount) {
			Alerts.insert({
				colorClass: 'bg-danger',
				iconClass: 'icn-danger',
				message: `You already have ${resourceCount} Resources.`,
			});
		} else {
			template.resourceDataCreating.set(true);
			Meteor.call('addResourceFixtures', function(error, result) {
				if (error) {
					template.resourceDataCreating.set(false);
					Alerts.insert({
						colorClass: 'bg-danger',
						iconClass: 'icn-danger',
						message: error.reason,
					});
				} else {
					Session.set('selectedResourceType', 'all');
					Session.set('selectedResourceAvailability', 'all');
					Session.set('selectedResourceId', result.resourceId);
					Session.set('selectedResourceCurrentTypeId', result.resourceType);
					template.resourceDataCreating.set(false);
				}
			});
		}
	},

	'click .js-school-work-data '(event, template) {
		event.preventDefault();

		let schoolWorkDataCreating = template.schoolWorkDataCreating.get();
		let dataRemoving = template.dataRemoving.get();

		let studentCount = Counts.get('studentCount');
		let schoolYearCount = Counts.get('schoolYearCount');
		let schoolWorkCount = Counts.get('schoolWorkCount');

		if (schoolWorkDataCreating || dataRemoving) {return false;}

		if (studentCount === 0 || schoolYearCount === 0) {
			Alerts.insert({
				colorClass: 'bg-danger',
				iconClass: 'icn-danger',
				message: 'You must add Students and School Years before adding School Work.',
			});
		} else {
			if (schoolWorkCount) {
				Alerts.insert({
					colorClass: 'bg-danger',
					iconClass: 'icn-danger',
					message: `You already have ${schoolWorkCount} items of School Work.`,
				});
			} else {
				template.schoolWorkDataCreating.set(true);
				Meteor.call('addSchoolWorkFixtures', function(error, result) {
					if (error) {
						template.schoolWorkDataCreating.set(false);
						Alerts.insert({
							colorClass: 'bg-danger',
							iconClass: 'icn-danger',
							message: error.reason,
						});
					} else {
						Session.set('selectedSchoolWorkId', result.schoolWorkId);
						Session.set('selectedSchoolWorkType', result.schoolWorkType);
						template.schoolWorkDataCreating.set(false);
					}
				});
			}
		}
	},

	'click .js-lesson-data '(event, template) {
		event.preventDefault();

		let lessonDataCreating = template.lessonDataCreating.get();
		let dataRemoving = template.dataRemoving.get();

		let studentCount = Counts.get('studentCount');
		let schoolYearCount = Counts.get('schoolYearCount');
		let schoolWorkCount = Counts.get('schoolWorkCount');
		let lessonCount = Counts.get('lessonCount');

		if (lessonDataCreating || dataRemoving) {return false;}

		if (studentCount === 0 || schoolYearCount === 0 || schoolWorkCount === 0) {
			Alerts.insert({
				colorClass: 'bg-danger',
				iconClass: 'icn-danger',
				message: 'You must add Students, School Years and School Work before adding Segments.',
			});
		} else {
			if (lessonCount) {
				Alerts.insert({
					colorClass: 'bg-danger',
					iconClass: 'icn-danger',
					message: `You already have ${lessonCount} Segments.`,
				});
			} else {
				template.lessonDataCreating.set(true);
				Meteor.call('addLessonFixtures', function(error, result) {
					if (error) {
						template.lessonDataCreating.set(false);
						Alerts.insert({
							colorClass: 'bg-danger',
							iconClass: 'icn-danger',
							message: error.reason,
						});
					} else {
						Session.set('selectedSchoolYearId', result.schoolYearId);
						Session.set('selectedTermId', result.termId);
						Session.set('selectedWeekId', result.weekId);
						template.lessonDataCreating.set(false);
					}
				});
			}
		}
	},

	'click .js-remove-data '(event, template) {
		event.preventDefault();

		let dataRemoving = template.dataRemoving.get();
		let studentDataCreating = template.studentDataCreating.get();
		let schoolYearDataCreating = template.schoolYearDataCreating.get();
		let resourceDataCreating = template.resourceDataCreating.get();
		let schoolWorkDataCreating = template.schoolWorkDataCreating.get();
		let lessonDataCreating = template.lessonDataCreating.get();

		let studentCount = Counts.get('studentCount');
		let schoolYearCount = Counts.get('schoolYearCount');
		let resourceCount = Counts.get('resourceCount');
		let schoolWorkCount = Counts.get('subjectCount') + Counts.get('schoolWorkCount');
		let lessonCount = Counts.get('lessonCount');

		if (dataRemoving || studentDataCreating || schoolYearDataCreating || resourceDataCreating || schoolWorkDataCreating || lessonDataCreating) {return false;}

		if (studentCount === 0 && schoolYearCount === 0 && resourceCount === 0 && schoolWorkCount === 0 && lessonCount === 0) {
			Alerts.insert({
				colorClass: 'bg-danger',
				iconClass: 'icn-danger',
				message: 'You must have data before you can delete data.',
			});
		} else {
			template.dataRemoving.set(true);
			Meteor.call('removeFixtureData', function(error, result) {
				if (error) {
					template.dataRemoving.set(false);
					Alerts.insert({
						colorClass: 'bg-danger',
						iconClass: 'icn-danger',
						message: error.reason,
					});
				} else {
					Session.set('selectedStudentId', result.studentId);
					Session.set('selectedSchoolYearId', result.schoolYearId);
					Session.set('selectedTermId', result.termId);
					Session.set('selectedWeekId', result.weekId);
					Session.set('selectedResourceId', result.resourceId);
					Session.set('selectedResourceCurrentTypeId', result.resourceType);
					Session.set('selectedSchoolWorkId', result.schoolWorkId);
					Session.set('selectedSchoolWorkType', result.schoolWorkType);
					template.dataRemoving.set(false);
				}
			});
		}
	},
});



