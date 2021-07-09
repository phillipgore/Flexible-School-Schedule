import {Reports} from '../reports.js';
import {SchoolYears} from '../../schoolYears/schoolYears.js';
import {Terms} from '../../terms/terms.js';
import {Weeks} from '../../weeks/weeks.js';
import {Subjects} from '../../subjects/subjects.js';
import {SchoolWork} from '../../schoolWork/schoolWork.js';
import {Notes} from '../../notes/notes.js';
import {Resources} from '../../resources/resources.js';
import {Lessons} from '../../lessons/lessons.js';

import {minutesConvert} from '../../../modules/server/functions';
import _ from 'lodash';

Meteor.publish('allReports', function() {
	if (!this.userId) {
		return this.ready();
	}

	let groupId = Meteor.users.findOne({_id: this.userId}).info.groupId;
	return Reports.find({groupId: groupId}, {fields: {name: 1}});
});

Meteor.publish('report', function(reportId) {
	if (!this.userId) {
		return this.ready();
	}

	let groupId = Meteor.users.findOne({_id: this.userId}).info.groupId;
	return Reports.find({_id: reportId, groupId: groupId});
});

Meteor.publish('reportData', function(studentId, schoolYearId, termId, weekId, reportId) {
	// this.autorun(function (computation) {
		if (!this.userId) {
			return this.ready();
		}

		let self = this;
		let groupId = Meteor.users.findOne({_id: this.userId}).info.groupId;
		let parameters = [studentId, schoolYearId, termId, weekId, reportId]

		if (!_.includes(parameters, 'empty')) {
			let report = Reports.findOne({_id: reportId, groupId: groupId});
			self.added('reports', report._id, report);

			function getReportTerms(termId) {
				if (termId === 'allTerms') {
					return Terms.find({groupId: groupId, schoolYearId: schoolYearId}).fetch();
				} else {
					return Terms.find({_id: termId}).fetch();
				}
			}

			let reportTerms = getReportTerms(termId);

			function getReportWeeks(weekId) {
				if (weekId === 'allWeeks') {
					return Weeks.find({groupId: groupId, termId: {$in: reportTerms.map(term => term._id)}}).fetch();
				} else {
					return Weeks.find({_id: weekId}).fetch();
				}
			}

			let reportWeeks = getReportWeeks(weekId);

			function percentComplete(completedTotal, total) {
				if (!completedTotal || !total) {
					return 0;
				} else {
					return completedTotal / total * 100;
				}
			}



			// School Year Data
			let yearSchoolYear = SchoolYears.find({_id: schoolYearId, groupId: groupId}).fetch();
			let yearTerms = Terms.find({schoolYearId: schoolYearId}).fetch();
			let yearWeeks = Weeks.find({termId: {$in: yearTerms.map(term => term._id)}}).fetch();
			let yearSchoolWork = SchoolWork.find({groupId: groupId, schoolYearId: schoolYearId, studentId: studentId}, {sort: {name: 1}}).fetch();
			let yearNotes = Notes.find({groupId: groupId, schoolWorkId: {$in: yearSchoolWork.map(work => work._id)}}).fetch();
			let yearLessons = Lessons.find({groupId: groupId, schoolWorkId: {$in: yearSchoolWork.map(schoolWork => schoolWork._id)}}, {sort: {order: 1}}).fetch();
			let yearResources = Resources.find(
				{
					_id: {$in: _.flatten(yearSchoolWork.map(schoolWork => schoolWork.resources))}, 
					groupId: groupId
				}, 
				{
					sort: {title: 1}, 
					fields: {type: 1, title: 1, availability: 1, link: 1}
				}
			).fetch();

			let yearLessonCompletionTimes = _.filter(yearLessons, ['completed', true]).map(lesson => (lesson.completionTime)).filter(time => (time != undefined));
			let yearLessonsCompletedTotal = _.filter(yearLessons, ['completed', true]).length;

			if (report.schoolYearReportVisible) {
				let schoolYearStats = {};

				schoolYearStats.schoolYearId = schoolYearId;

				let yearLessonsTotal = yearLessons.length;
				let yearLessonsCompletedTotal = _.filter(yearLessons, ['completed', true]).length;
				let yearPercentComplete = percentComplete(yearLessonsCompletedTotal, yearLessonsTotal);
				let yearLessonsIncompletedTotal = _.filter(yearLessons, ['completed', false]).length;

				// Progress
				function progress(percentComplete) {
					if (percentComplete > 0 && percentComplete < 1) {
						return 1;
					} 
					return Math.floor(percentComplete);
				};

				function progressStatus(lessonsIncompleteTotal) {
					if (!lessonsIncompleteTotal) {
						return true;
					} 
					return false;
				};

				schoolYearStats.progress = progress(yearPercentComplete);
				schoolYearStats.progressComplete = progressStatus(yearLessonsIncompletedTotal);

				// Scheduled
				schoolYearStats.termCount = yearTerms.length;
				schoolYearStats.schoolWorkCount = yearSchoolWork.length;
				schoolYearStats.weekCount = yearWeeks.length;
				schoolYearStats.dayCount = yearWeeks.length * report.weekEquals;
				schoolYearStats.lessonCount = yearLessons.length;

				// Completed
				let completeSchoolWorkIds = []
				yearSchoolWork.forEach(work => {
					let totalLessons = yearLessons.filter(lesson => lesson.schoolWorkId === work._id).length;
					let completedLessons = yearLessons.filter(lesson => lesson.schoolWorkId === work._id && lesson.completed).length;
					let incompletedLessons = yearLessons.filter(lesson => lesson.schoolWorkId === work._id && !lesson.completed).length;
					let partiallyCompletedPercentage = Math.trunc(completedLessons / totalLessons * 100);

					if (totalLessons && !incompletedLessons) {completeSchoolWorkIds.push(work._id)}
				});
				let yearPercentageCompleted = schoolYearStats.progress / 100;

				schoolYearStats.termsCompletedCount = (yearPercentageCompleted * schoolYearStats.termCount).toFixed(2);
				schoolYearStats.schoolWorkCompletedCount = completeSchoolWorkIds.length;
				schoolYearStats.weeksCompletedCount = (yearPercentageCompleted * schoolYearStats.weekCount).toFixed(2);
				schoolYearStats.daysCompletedCount = (yearPercentageCompleted * schoolYearStats.dayCount).toFixed(2);
				schoolYearStats.lessonsCompletedCount = yearLessons.filter(lesson => lesson.completed).length;

				// Time
				let hasCompletedLessonWeekIds = _.uniq(_.filter(yearLessons, ['completed', true]).map(lesson => (lesson.weekId)));
				let hasCompletedLessonTermIds = Weeks.find({_id: {$in: hasCompletedLessonWeekIds}}).map(week => (week.termId));
				let yearTermsTotal = Terms.find({_id: {$in: hasCompletedLessonTermIds}}).count();			
				let yearWeeksTotal = hasCompletedLessonWeekIds.length;
				let yearDaysTotal = yearWeeksTotal * report.weekEquals

				let yearTotalTimeMinutes = _.sum(yearLessonCompletionTimes);
				let yearAverageTermMinutes = _.sum(yearLessonCompletionTimes) / yearTermsTotal;
				let yearAverageWeekMinutes = _.sum(yearLessonCompletionTimes) / yearWeeksTotal;
				let yearAverageDayMinutes = _.sum(yearLessonCompletionTimes) / yearDaysTotal;
				let yearAverageLessonMinutes = _.sum(yearLessonCompletionTimes) / yearLessonsCompletedTotal;

				schoolYearStats.totalTime = minutesConvert(yearTotalTimeMinutes);
				schoolYearStats.averageLessons = minutesConvert(yearAverageLessonMinutes);
				schoolYearStats.averageDays = minutesConvert(yearAverageDayMinutes);
				schoolYearStats.averageWeeks = minutesConvert(yearAverageWeekMinutes);
				schoolYearStats.averageTerms = minutesConvert(yearAverageTermMinutes);

				self.added('schoolYears', schoolYearId, schoolYearStats);
			}




			// Term & School Work Data
			let termsStats = [];
			if (report.termsReportVisible) {
				reportTerms.forEach((term) => {
					let termData = {};

					let termWeekIds = _.filter(yearWeeks, ['termId', term._id]).map(week => (week._id));
					let termSchoolWorkIds = _.uniq(_.filter(yearLessons, lesson => _.includes(termWeekIds, lesson.weekId)).map(lesson => lesson.schoolWorkId));
					let termSchoolWork = _.filter(yearSchoolWork, schoolWork => _.includes(termSchoolWorkIds, schoolWork._id));
					let termLessons = _.filter(yearLessons, lesson => _.includes(termWeekIds, lesson.weekId));
					let termLessonsTotal = termLessons.length;

					termData._id = term._id;
					termData.order = term.order;
					termData.schoolYearId = schoolYearId;

					// Progress
					let lessonsCompletedTotal = _.filter(termLessons, ['completed', true]).length;
					let termPercentComplete = percentComplete(lessonsCompletedTotal, termLessonsTotal);
					
					if (termPercentComplete > 0 && termPercentComplete < 1) {
						termData.progress =  1;
					} else {
						termData.progress = Math.floor(termPercentComplete);
					}

					let lessonsIncompleteTotal = _.filter(termLessons, ['completed', false]).length;
					if (!lessonsIncompleteTotal) {
						termData.progressComplete = true;
					} else {
						termData.progressComplete = false;
					}

					// Scheduled
					termData.schoolWorkCount = termSchoolWork.length;
					termData.weekCount = termWeekIds.length;
					termData.dayCount =  termWeekIds.length * report.weekEquals
					termData.lessonCount = termLessonsTotal;

					// Completed
					let completeSchoolWorkIds = []
					termSchoolWork.forEach(work => {
						let totalLessons = termLessons.filter(lesson => lesson.schoolWorkId === work._id).length;
						let completedLessons = termLessons.filter(lesson => lesson.schoolWorkId === work._id && lesson.completed).length;
						let incompletedLessons = termLessons.filter(lesson => lesson.schoolWorkId === work._id && !lesson.completed).length;
						let partiallyCompletedPercentage = Math.trunc(completedLessons / totalLessons * 100);

						if (!incompletedLessons) {completeSchoolWorkIds.push(work._id)}
					});

					let termPercentageCompleted = termData.progress / 100;
					if (report.schoolYearCompletedVisible) {
						termData.schoolWorkCompletedCount = completeSchoolWorkIds.length;
						termData.weeksCompletedCount = (termPercentageCompleted * termData.weekCount).toFixed(2);
						termData.daysCompletedCount = (termPercentageCompleted * termData.dayCount).toFixed(2);
						termData.lessonsCompletedCount = termLessons.filter(lesson => lesson.completed).length;
					}
					
					// Time
					let lessonCompletionTimes = _.filter(termLessons, ['completed', true]).map(lesson => (lesson.completionTime)).filter(time => (time != undefined));
					let totalMinutes = _.sum(lessonCompletionTimes);

					termData.totalTime = minutesConvert(totalMinutes);

					let completedWeekIds = _.uniq(_.filter(termLessons, ['completed', true]).map(lesson => (lesson.weekId)));
					let weeksTotal = completedWeekIds.length;
					let averageWeekMinutes = _.sum(lessonCompletionTimes) / weeksTotal;
					termData.averageWeeks = minutesConvert(averageWeekMinutes);

					let termDaysTotal = weeksTotal * report.weekEquals
					let termAverageDayMinutes = totalMinutes / termDaysTotal;
					termData.averageDays = minutesConvert(termAverageDayMinutes);

					let averageLessonMinutes = _.sum(lessonCompletionTimes) / lessonCompletionTimes.length;
					termData.averageLessons = minutesConvert(averageLessonMinutes);


					termsStats.push(termData);
				});
			}
			termsStats.forEach(term => {
				self.added('terms', term._id, term);
			});




			// Subjects Data
			let subjectStats = [];
			if (report.schoolWorkReportVisible) {
				let weekIds = reportWeeks.map(week => week._id);
				let lessons = yearLessons.filter(yearlesson => weekIds.includes(yearlesson.weekId));

				let schoolWorkIds = lessons.map(lesson => lesson.schoolWorkId);
				let schoolWork = yearSchoolWork.filter(yearWork => schoolWorkIds.includes(yearWork._id));

				let getSubjectIds = schoolWork.map(work => work.subjectId);
				let subjectIds = getSubjectIds.filter((subjectId, index) => subjectId && getSubjectIds.indexOf(subjectId) === index);
				let subjects = Subjects.find({_id: {$in: subjectIds}}).fetch();

				// Work wih no subject.
				let noSubject =	{_id: 'noSubject', name: 'No Subject', schoolYearId: schoolYearId, studentId: studentId,};
				subjects.push(noSubject);

				subjects.forEach((subject) => {
					let subjectData = {};

					subjectData._id = subject._id;
					subjectData.name = subject.name;
					subjectData.schoolYearId = subject.schoolYearId;
					subjectData.studentId = subject.studentId;

					let subjectLessons = subject._id === 'noSubject' ? 
						lessons.filter(lesson => !lesson.subjectId) :
						lessons.filter(lesson => lesson.subjectId === subject._id);

					let subjectTermIds = _.uniq(subjectLessons.map(lesson => lesson.termId));
					let subjectWorkIds = _.uniq(subjectLessons.map(lesson => lesson.schoolWorkId));
					let subjectWeekIds = _.uniq(subjectLessons.map(lesson => lesson.weekId));

					let subjectLessonsTotal = subjectLessons.length;
					let subjectLessonsCompletedTotal = subjectLessons.filter(lesson => lesson.completed).length;
					let subjectLessonsIncompleteTotal = subjectLessons.filter(lesson => !lesson.completed).length;
					let subjectPercentComplete = percentComplete(subjectLessonsCompletedTotal, subjectLessonsTotal);

					// Progress
					if (subjectPercentComplete > 0 && subjectPercentComplete < 1) {
						subjectData.progress = 1;
					} else {
						subjectData.progress = Math.floor(subjectPercentComplete);
					}

					if (!subjectLessonsIncompleteTotal) {
						subjectData.progressComplete = true;
					} else {
						subjectData.progressComplete = false;
					}

					// Scheduled
					subjectData.termCount = subjectTermIds.length;
					subjectData.schoolWorkCount = subjectWorkIds.length;
					subjectData.weekCount = subjectWeekIds.length;
					subjectData.lessonCount = subjectLessons.length;

					// Completed
					let completeSchoolWorkIds = []
					subjectWorkIds.forEach(workId => {
						let totalLessons = subjectLessons.filter(lesson => lesson.schoolWorkId === workId).length;
						let completedLessons = subjectLessons.filter(lesson => lesson.schoolWorkId === workId && lesson.completed).length;
						let incompletedLessons = subjectLessons.filter(lesson => lesson.schoolWorkId === workId && !lesson.completed).length;
						let partiallyCompletedPercentage = Math.trunc(completedLessons / totalLessons * 100);

						if (!incompletedLessons) {completeSchoolWorkIds.push(workId)}
					});

					let subjectPercentageCompleted = subjectData.progress / 100;
					if (report.schoolYearCompletedVisible) {
						subjectData.schoolWorkCompletedCount = completeSchoolWorkIds.length;
						subjectData.termsCompletedCount = (subjectPercentageCompleted * subjectData.termCount).toFixed(2);
						subjectData.weeksCompletedCount = (subjectPercentageCompleted * subjectData.weekCount).toFixed(2);
						subjectData.lessonsCompletedCount = subjectLessons.filter(lesson => lesson.completed).length;
					}

					// Time
					let lessonCompletionTimes = _.filter(subjectLessons, ['completed', true]).map(lesson => (lesson.completionTime)).filter(time => (time != undefined));
					let totalMinutes = _.sum(lessonCompletionTimes);
					subjectData.totalTime = minutesConvert(totalMinutes);

					let completedTermIds = _.uniq(_.filter(subjectLessons, ['completed', true]).map(lesson => (lesson.termId)));
					let termsTotal = completedTermIds.length;
					let averagTermMinutes = _.sum(lessonCompletionTimes) / termsTotal;
					subjectData.averageTerms = minutesConvert(averagTermMinutes);

					let completedWeekIds = _.uniq(_.filter(subjectLessons, ['completed', true]).map(lesson => (lesson.weekId)));
					let weeksTotal = completedWeekIds.length;
					let averageWeekMinutes = _.sum(lessonCompletionTimes) / weeksTotal;
					subjectData.averageWeeks = minutesConvert(averageWeekMinutes);

					let averageLessonMinutes = _.sum(lessonCompletionTimes) / lessonCompletionTimes.length;
					subjectData.averageLessons = minutesConvert(averageLessonMinutes);


					subjectStats.push(subjectData);
				});
			}
			subjectStats.forEach(subject => {
				self.added('subjects', subject._id, subject);
			});




			// School Work Data
			let schoolWorkStats = [];
			if (report.schoolWorkReportVisible) {
				let weekIds = reportWeeks.map(week => week._id);
				let lessons = _.filter(yearLessons, lesson => _.includes(weekIds, lesson.weekId));
				let schoolWork = _.filter(yearSchoolWork, schoolWork => _.includes(lessons.map(lesson => lesson.schoolWorkId), schoolWork._id));

				schoolWork.forEach((schoolWork) => {
					let schoolWorkData = {};

					let schoolWorkLessons = _.filter(lessons, ['schoolWorkId', schoolWork._id]);
					let schoolWorkWeeks = _.filter(reportWeeks, week => _.includes(schoolWorkLessons.map(lesson => lesson.weekId), week._id));
					let schoolWorkTerms = _.filter(reportTerms, term => _.includes(schoolWorkWeeks.map(week => week.termId), term._id));

					schoolWorkData._id = schoolWork._id;
					schoolWorkData.weekData = [];
					schoolWorkData.order = schoolWork.order;
					schoolWorkData.name = schoolWork.name;
					schoolWorkData.subjectId = schoolWork.subjectId;
					schoolWorkData.studentId = studentId;
					schoolWorkData.schoolYearId = schoolYearId;

					if (report.schoolWorkDescriptionVisible) {
						schoolWorkData.description = schoolWork.description;
					}

					if (report.schoolWorkResourcesVisible) {
						let schoolWorkResources = _.filter(yearResources, resource => _.includes(schoolWork.resources, resource._id));
						schoolWorkData.resources = schoolWorkResources;
					}

					if (report.schoolWorkStatsVisible) {
						schoolWorkData.termCount = schoolWorkTerms.length;
						schoolWorkData.weekCount = schoolWorkWeeks.length;
						schoolWorkData.lessonCount = schoolWorkLessons.length;
					}

					if (report.schoolWorkProgressVisible) {
						// School Work Year Progress
						let lessonsTotal = schoolWorkLessons.length;
						let lessonsCompletedTotal = _.filter(schoolWorkLessons, ['completed', true]).length;
						let schoolWorkPercentComplete = percentComplete(lessonsCompletedTotal, lessonsTotal);
						if (schoolWorkPercentComplete > 0 && schoolWorkPercentComplete < 1) {
							schoolWorkData.progress = 1;
						} else {
							schoolWorkData.progress = Math.floor(schoolWorkPercentComplete);
						}

						// School Work Year Progress Status
						let lessonsIncompleteTotal = _.filter(schoolWorkLessons, ['completed', false]).length;
						if (!lessonsIncompleteTotal) {
							schoolWorkData.progressComplete = true;
						} else {
							schoolWorkData.progressComplete = false;
						}
					}

					if (report.schoolWorkTimesVisible) {
						// School Work Year Total Time
						let lessonCompletionTimes = _.filter(schoolWorkLessons, ['completed', true]).map(lesson => (lesson.completionTime)).filter(time => (time != undefined));
						let totalMinutes = _.sum(lessonCompletionTimes);
						schoolWorkData.totalTime = minutesConvert(totalMinutes);

						// School Work Year Average Lesssons
						let averageLessonsMinutes = _.sum(lessonCompletionTimes) / lessonCompletionTimes.length;
						schoolWorkData.averageLessons = minutesConvert(averageLessonsMinutes);

						// School Work Year Average Weeks
						let weeksTotal = _.uniq( _.filter(schoolWorkLessons, ['completed', true]).map(lesson => (lesson.weekId)) ).length;
						let averageWeekMinutes = _.sum(lessonCompletionTimes) / weeksTotal;
						schoolWorkData.averageWeeks = minutesConvert(averageWeekMinutes); 

						// School Work Year Average Terms
						let completedWeekIds = _.uniq( _.filter(schoolWorkLessons, ['completed', true]).map(lesson => (lesson.weekId)) );
						let termsTotal = _.uniq( _.filter(schoolWorkWeeks, week => _.includes(completedWeekIds, week._id)).map(week => week.termId) ).length;
						let averageTermMinutes = _.sum(lessonCompletionTimes) / termsTotal;
						schoolWorkData.averageTerms = minutesConvert(averageTermMinutes);
					}

					schoolWorkStats.push(schoolWorkData)
				});
			}
			schoolWorkStats.forEach(schoolWork => {
				self.added('schoolWork', schoolWork._id, schoolWork);
			});



			// Week Data
			let weekStats = [];
			reportWeeks.forEach(week => {
				weekData = {};

				weekData._id = week._id;
				weekData.order = week.order;
				weekData.termId = week.termId;

				if (report.timesPerWeekReportVisible) {
					// let notes = {}
					// yearNotes.filter(note => note.weekId === week._id).forEach(note => {
					// 	notes.push(note);
					// })
					// weekData.note = notes;
					weekData.noteData = yearNotes.filter(note => note.weekId === week._id);

					let lessonStats = [];
					let lessons = _.filter(yearLessons, ['weekId', week._id]);

					lessons.forEach(lesson => {
						let lessonData = {};

						lessonData._id = lesson._id;
						lessonData.order = lesson.order;
						lessonData.weekDay = parseInt(lesson.weekDay);
						lessonData.schoolWorkId = lesson.schoolWorkId;
						lessonData.completed = lesson.completed;
						if (lesson.completedOn) {
							lessonData.completedOn = lesson.completedOn.toDateString();
						}
						lessonData.completionTime = lesson.completionTime;
						lessonData.description = lesson.description;

						lessonStats.push(lessonData);
					});
					weekData.lessonData = lessonStats;
				}

				weekStats.push(weekData)
			});
			weekStats.forEach(week => {
				self.added('weeks', week._id, week);
			});



			// Resources Data
			if (report.resourcesReportVisible) {
				let weekIds = reportWeeks.map(week => week._id);
				let lessons = _.filter(yearLessons, lesson => _.includes(weekIds, lesson.weekId));
				let schoolWork = _.filter(yearSchoolWork, schoolWork => _.includes(lessons.map(lesson => lesson.schoolWorkId), schoolWork._id))
				let resourceIds = _.uniq(_.flattenDeep(schoolWork.map(work => work.resources)));
				let resources = Resources.find({_id: {$in: resourceIds}, groupId: groupId}, {sort: {title: 1}});

				let resourceStats = [];
				resources.forEach(resource => {
					let resourceData = {};

					resourceData._id = resource._id;
					resourceData.type = resource.type;
					resourceData.title = resource.title;

					if (report.resourcesOriginatorVisible) {
						resourceData.authorFirstName = resource.authorFirstName;
						resourceData.authorLastName = resource.authorLastName;
						resourceData.directorFirstName = resource.directorFirstName;
						resourceData.directorLastName = resource.directorLastName;
						resourceData.artistFirstName = resource.artistFirstName;
						resourceData.artistLastName = resource.artistLastName;
					}
					if (report.resourcesPublicationVisible) {
						resourceData.publisher = resource.publisher;
						resourceData.publicationDate = resource.publicationDate;
					}
					if (report.resourcesSchoolWorkVisible) {
						let resouceSchoolWorkData = []
						let resourceSchoolWork = SchoolWork.find({_id: {$in: schoolWork.map(work => work._id)}, resources: resource._id});
						resourceSchoolWork.forEach(work => {
							resouceSchoolWorkData.push(work.name);
						})
						resourceData.schoolWork = resouceSchoolWorkData;
					}
					if (report.resourcesLinkVisible) {
						resourceData.link = resource.link;
					}
					if (report.resourcesDescriptionVisible) {
						resourceData.description = resource.description;
					}

					resourceStats.push(resourceData);
				});

				resourceStats.map((rescource) => {
					self.added('resources', rescource._id, rescource);
				});
			}
		}	

		self.ready();
	// });
});










