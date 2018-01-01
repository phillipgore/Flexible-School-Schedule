import {Template} from 'meteor/templating';
import './toolbarResources.html';

Template.toolbarResources.helpers({
	leftUrl() {
		return Session.get('leftUrl');
	},
	leftIcon() {
		return Session.get('leftIcon');
	},
	label() {
		return Session.get('label');
	},
})