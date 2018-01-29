import {Template} from 'meteor/templating';
import './usersEdit.html';

Template.usersEdit.onCreated( function() {
	// Subscriptions
	this.subscribe('allUsers');
});

Template.usersEdit.onRendered( function() {
	// Toolbar Settings
	Session.set({
		leftUrl: '',
		leftIcon: '',
		label: 'Edit User',
		rightUrl: '',
		rightIcon: '',
	});

	$('.js-form-edit-user').validate({
		rules: {
			firstName: { required: true },
			lastName: { required: true },
			email: { required: true, email: true },
		},
		messages: {
			firstName: { required: "Required." },
			lastName: { required: "Required." },
			email: { required: "Required.", email: "Please enter a valid email address." },
		},
		submitHandler() {	
			const userProperties = {
				"emails.0.address": event.target.email.value.trim(),
				info: {
					firstName: event.target.firstName.value.trim(),
					lastName: event.target.lastName.value.trim(),
					relationshipToStudents: event.target.relationshipToStudents.value.trim(),
					role: event.target.role.value.trim(),
				},
			}

			Meteor.call('updateUser', FlowRouter.getParam('id'), userProperties, function(error) {
				if (error) {
					Alerts.insert({
						colorClass: 'bg-danger',
						iconClass: 'fss-danger',
						message: error.reason,
					});
				} else {
					FlowRouter.go('/settings/users/view/' + FlowRouter.getParam('id'));
				}
			});

			return false;
		}
	});
});

Template.usersEdit.helpers({
	relationships: [
		{label: 'I Am Mom', value: 'Mom'},
		{label: 'I Am Dad', value: 'Dad'},
		{label: 'I Am Brother', value: 'Brother'},
		{label: 'I Am Sister', value: 'Sister'},
		{label: 'I Am Tutor', value: 'Tutor'},
		{label: 'I Am Teacher', value: 'Teacher'},
		{label: 'I Am Grandma', value: 'Grandma'},
		{label: 'I Am Grandpa', value: 'Grandpa'},
		{label: 'I Am Aunt', value: 'Aunt'},
		{label: 'I Am Uncle', value: 'Uncle'},
	],

	user: function() {
		return Meteor.users.findOne({_id: FlowRouter.getParam('id')});
	},

	activeRelationship: function(currentRelationship, relationship) {
		if (currentRelationship === relationship) {
			return true;
		}
		return false;
	},

	role: function(currentRole, role) {
		if (currentRole === role) {
			return true;
		}
		return false;
	},

	disabled: function() {
		if (Meteor.users.find({'emails.0.verified': true}).count() > 1) {
			return false;
		}
		return true;
	},

	cancelPath: function() {
		return '/settings/users/view/' + FlowRouter.getParam('id');
	},
});

Template.usersEdit.events({
	'submit .js-form-edit-user'(event) {
		event.preventDefault();
	},
});
