import {Counts} from 'meteor/tmeasday:publish-counts';
import {Stats} from '../../stats/stats.js';
import {Students} from '../../students/students.js';
import {SchoolYears} from '../../schoolYears/schoolYears.js';
import {Resources} from '../../resources/resources.js';
import {Subjects} from '../../subjects/subjects.js';
import {SchoolWork} from '../../schoolWork/schoolWork.js';
import {Lessons} from '../../lessons/lessons.js';

import _ from 'lodash';

Meteor.publish('schoolWorkStats', function() {
	if (!this.userId) {
		return this.ready();
	}

	let groupId = Meteor.users.findOne({_id: this.userId}).info.groupId;
	Counts.publish(this, 'schoolWorkCount', SchoolWork.find({groupId: groupId}));
});

Meteor.publish('resourceStats', function() {
	if (!this.userId) {
		return this.ready();
	}
	
	let groupId = Meteor.users.findOne({_id: this.userId}).info.groupId;
	Counts.publish(this, 'allAllCount', Resources.find({groupId: groupId}));
	Counts.publish(this, 'bookAllCount', Resources.find({type: 'book', groupId: groupId}));
	Counts.publish(this, 'linkAllCount', Resources.find({type: 'link', groupId: groupId}));
	Counts.publish(this, 'videoAllCount', Resources.find({type: 'video', groupId: groupId}));
	Counts.publish(this, 'audioAllCount', Resources.find({type: 'audio', groupId: groupId}));
	Counts.publish(this, 'appAllCount', Resources.find({type: 'app', groupId: groupId}));

	Counts.publish(this, 'allOwnCount', Resources.find({availability: 'own', groupId: groupId}));
	Counts.publish(this, 'bookOwnCount', Resources.find({type: 'book', availability: 'own', groupId: groupId}));
	Counts.publish(this, 'linkOwnCount', Resources.find({type: 'link', availability: 'own', groupId: groupId}));
	Counts.publish(this, 'videoOwnCount', Resources.find({type: 'video', availability: 'own', groupId: groupId}));
	Counts.publish(this, 'audioOwnCount', Resources.find({type: 'audio', availability: 'own', groupId: groupId}));
	Counts.publish(this, 'appOwnCount', Resources.find({type: 'app', availability: 'own', groupId: groupId}));

	Counts.publish(this, 'allBorrowedCount', Resources.find({availability: 'borrowed', groupId: groupId}));
	Counts.publish(this, 'bookBorrowedCount', Resources.find({type: 'book', availability: 'borrowed', groupId: groupId}));
	Counts.publish(this, 'linkBorrowedCount', Resources.find({type: 'link', availability: 'borrowed', groupId: groupId}));
	Counts.publish(this, 'videoBorrowedCount', Resources.find({type: 'video', availability: 'borrowed', groupId: groupId}));
	Counts.publish(this, 'audioBorrowedCount', Resources.find({type: 'audio', availability: 'borrowed', groupId: groupId}));
	Counts.publish(this, 'appBorrowedCount', Resources.find({type: 'app', availability: 'borrowed', groupId: groupId}));

	Counts.publish(this, 'allNeedCount', Resources.find({availability: 'need', groupId: groupId}));
	Counts.publish(this, 'bookNeedCount', Resources.find({type: 'book', availability: 'need', groupId: groupId}));
	Counts.publish(this, 'linkNeedCount', Resources.find({type: 'link', availability: 'need', groupId: groupId}));
	Counts.publish(this, 'videoNeedCount', Resources.find({type: 'video', availability: 'need', groupId: groupId}));
	Counts.publish(this, 'audioNeedCount', Resources.find({type: 'audio', availability: 'need', groupId: groupId}));
	Counts.publish(this, 'appNeedCount', Resources.find({type: 'app', availability: 'need', groupId: groupId}));

	Counts.publish(this, 'allReturnedCount', Resources.find({availability: 'returned', groupId: groupId}));
	Counts.publish(this, 'bookReturnedCount', Resources.find({type: 'book', availability: 'returned', groupId: groupId}));
	Counts.publish(this, 'linkReturnedCount', Resources.find({type: 'link', availability: 'returned', groupId: groupId}));
	Counts.publish(this, 'videoReturnedCount', Resources.find({type: 'video', availability: 'returned', groupId: groupId}));
	Counts.publish(this, 'audioReturnedCount', Resources.find({type: 'audio', availability: 'returned', groupId: groupId}));
	Counts.publish(this, 'appReturnedCount', Resources.find({type: 'app', availability: 'returned', groupId: groupId}));
});

Meteor.publish('progressStatsPub', function() {
	if (!this.userId) {
		return this.ready();
	}

	let groupId = Meteor.users.findOne({_id: this.userId}).info.groupId;
	return Stats.find({groupId: groupId}, {fields: {createdOn: 0, updatedOn: 0}});
});

Meteor.publish('testDataStats', function() {
	if (!this.userId) {
		return this.ready();
	}

	let groupId = Meteor.users.findOne({_id: this.userId}).info.groupId;
	
	Counts.publish(this, 'studentCount', Students.find({groupId: groupId}));
	Counts.publish(this, 'schoolYearCount', SchoolYears.find({groupId: groupId}));
	Counts.publish(this, 'resourceCount', Resources.find({groupId: groupId}));
	Counts.publish(this, 'schoolWorkCount', SchoolWork.find({groupId: groupId}));
	Counts.publish(this, 'subjectCount', Subjects.find({groupId: groupId}));
	Counts.publish(this, 'lessonCount', Lessons.find({groupId: groupId}));
});