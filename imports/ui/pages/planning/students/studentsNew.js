import {Template} from 'meteor/templating';
import './studentsNew.html';

import moment from 'moment';

Template.studentsNew.onRendered( function() {
	let template = Template.instance();

	Session.set({
		toolbarType: 'new',
		labelThree: 'New Student',
		activeNav: 'planningList',
	});

	// Form Validation and Submission
	$('.js-form-students-new').validate({
		rules: {
			firstName: { required: true },
			lastName: { required: true },
			middleName: { required: false },
			nickname: { required: false },
			birthday: { required: true, date: true },
		},
		messages: {
			firstName: { required: "Required." },
			lastName: { required: "Required." },
			birthday: { required: "Required.", date: "Please enter a valid date." },
		},		

		submitHandler() {
			$('.js-saving').show();
			$('.js-submit').prop('disabled', true);

			const studentProperties = {
				firstName: template.find("[name='firstName']").value.trim(),
				middleName: template.find("[name='middleName']").value.trim(),
				lastName: template.find("[name='lastName']").value.trim(),
				nickname: template.find("[name='nickname']").value.trim(),
				preferredFirstName: template.find("[name='preferredFirstName']:checked").value.trim(),
				birthday: Date.parse(template.find("[name='birthday']").value.trim()),
			}
			
			studentProperties.birthday = selectedDate = moment(studentProperties.birthday).add(moment(studentProperties.birthday).utcOffset(), 'm').utc().format();

			if (studentProperties.preferredFirstName === 'firstName') {
				studentProperties.preferredFirstName = {type: 'firstName', name: studentProperties.firstName};
			} else if (studentProperties.preferredFirstName === 'middleName') {
				studentProperties.preferredFirstName = {type: 'middleName', name: studentProperties.middleName};
			} else {
				studentProperties.preferredFirstName = {type: 'nickname', name: studentProperties.nickname};
			}
			
			Meteor.call('insertStudent', studentProperties, function(error, studentId) {
				if (error) {
					Alerts.insert({
						colorClass: 'bg-danger',
						iconClass: 'icn-danger',
						message: error.reason,
					});
					
					$('.js-saving').hide();
					$('.js-submit').prop('disabled', false);
				} else {
					Session.set('selectedStudentId', studentId);
					FlowRouter.go('/planning/students/view/3/' + studentId);
				}
			});

			return false;
		}
	});
});

Template.studentsNew.helpers({
	selectedStudentId: function() {
		return Session.get('selectedStudentId');
	},
});

Template.studentsNew.events({
	'keyup .js-input-middle-name'(event) {
		if (event.target.value.trim().length) {
			$('.js-radio-middle-name').prop('disabled', false);
		} else {
			if ($('.js-radio-middle-name').prop('checked')) {
				$('.js-radio-middle-name').prop('checked', false);
				$('.js-radio-first-name').prop('checked', true);
			}
			$('.js-radio-middle-name').prop('disabled', true);	
		}
	},

	'keyup .js-input-nickname'(event) {
		if (event.target.value.trim().length) {
			$('.js-radio-nickname').prop('disabled', false);
		} else {
			if ($('.js-radio-nickname').prop('checked')) {
				$('.js-radio-nickname').prop('checked', false);
				$('.js-radio-first-name').prop('checked', true);
			}
			$('.js-radio-nickname').prop('disabled', true);
		}
	},

	'submit .js-form-students-new'(event) {
		event.preventDefault();
	},
});