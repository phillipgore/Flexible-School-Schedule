import {SchoolWork} from '../schoolWork/schoolWork.js';
import {Resources} from './resources.js';
import {resourcesInitialIds} from '../../modules/server/initialIds';

import _ from 'lodash'

Meteor.methods({
	getInitialResourceIds() {
		if (!this.userId) {
			return false;
		}

		let groupId = Meteor.users.findOne({_id: this.userId}).info.groupId;
		let ids = {};

		let resourceTypes = ['all', 'book', 'link', 'video', 'audio', 'app'];
		let resourceAvailabilities = ['all', 'own', 'borrowed', 'need', 'returned'];

		resourceTypes.forEach((type) => {
			resourceAvailabilities.forEach((availability) => {
				function query (type, availability) {
					if (type === 'all' && availability === 'all') {
						return {groupId: groupId};
					}
					if (type === 'all' && availability != 'all') {
						return {availability: availability, groupId: groupId};
					}
					if (type != 'all' && availability === 'all') {
						return {type: type, groupId: groupId};
					}
					return {type: type, availability: availability, groupId: groupId};
				};

				let keyName = _.capitalize(type) + _.capitalize(availability);
				let valueResource = Resources.findOne(query(type, availability), {sort: {title: 1}, fields: {_id: 1}});

				if (valueResource) {ids['resource' + keyName] = valueResource._id} else {ids['resource' + keyName] = 'empty'};
			})
		});

		let valueFirstResource = Resources.findOne({groupId: groupId}, {sort: {title: 1}, fields: {type: 1}});
		if (valueFirstResource) {ids['resourceCurrentType'] = valueFirstResource.type} else {ids['resourceCurrentType'] = 'empty'};

		return ids;
	},

	insertResource(resourceProperties) {
		const resourcesView = Resources.insert(resourceProperties, function(error, result) {
			if (error) {
				console.log(error)
			} else {
				resourcesInitialIds();
			}
		});
		return resourcesView
	},

	updateResource: function(resourceId, resourceProperties) {
		Resources.update(resourceId, {$set: resourceProperties}, function(error, result) {
			if (error) {
				console.log(error)
			} else {
				resourcesInitialIds();
			}
		});
	},

	deleteResource: function(resourceId) {
		Resources.remove({_id: resourceId}, function(error, result) {
			if (error) {
				console.log(error)
			} else {
				resourcesInitialIds();
			}
		});
		SchoolWork.update({}, {$pull: {resources: resourceId}}, {multi: true});
	}
})