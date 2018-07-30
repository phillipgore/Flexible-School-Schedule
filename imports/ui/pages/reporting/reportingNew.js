import { Template } from 'meteor/templating';
import { Reports } from '../../../api/reports/reports.js';
import './reportingNew.html';

Template.reportingNew.onCreated( function() {
	
});

Template.reportingNew.onRendered( function() {
	let template = Template.instance();

	Session.set({
		toolbarType: 'new',
		labelTwo: 'New Report',
		activeNav: 'reportingList',
	});

	// Form Validation and Submission
	$('.js-form-reports-new').validate({
		rules: {
			name: { required: true },
		},
		messages: {
			name: { required: "Required." },
		},		

		submitHandler() {
			$('.js-saving').show();
			$('.js-submit').prop('disabled', true);

			let reportPoperties = {
				name: template.find("[name='name']").value.trim(),
				
				schoolYearReportVisible: template.find("[name='schoolYearReportVisible']").value.trim() === 'true',
				schoolYearStatsVisible: template.find("[name='schoolYearStatsVisible']").value.trim() === 'true',
				schoolYearProgressVisible: template.find("[name='schoolYearProgressVisible']").value.trim() === 'true',
				schoolYearTimesVisible: template.find("[name='schoolYearTimesVisible']").value.trim() === 'true',
				
				termsReportVisible: template.find("[name='termsReportVisible']").value.trim() === 'true',
				termsStatsVisible: template.find("[name='termsStatsVisible']").value.trim() === 'true',
				termsProgressVisible: template.find("[name='termsProgressVisible']").value.trim() === 'true',
				termsTimesVisible: template.find("[name='termsTimesVisible']").value.trim() === 'true',
				
				schoolWorkReportVisible: template.find("[name='schoolWorkReportVisible']").value.trim() === 'true',
				schoolWorkStatsVisible: template.find("[name='schoolWorkStatsVisible']").value.trim() === 'true',
				schoolWorkProgressVisible: template.find("[name='schoolWorkProgressVisible']").value.trim() === 'true',
				schoolWorkTimesVisible: template.find("[name='schoolWorkTimesVisible']").value.trim() === 'true',
				schoolWorkResourcesVisible: template.find("[name='schoolWorkResourcesVisible']").value.trim() === 'true',

				resourcesReportVisible: template.find("[name='resourcesReportVisible']").value.trim() === 'true',
				resourcesOriginatorVisible: template.find("[name='resourcesOriginatorVisible']").value.trim() === 'true',
				resourcesPublicationVisible: template.find("[name='resourcesPublicationVisible']").value.trim() === 'true',
				resourcesSchoolWorkVisible: template.find("[name='resourcesSchoolWorkVisible']").value.trim() === 'true',
				resourcesLinkVisible: template.find("[name='resourcesLinkVisible']").value.trim() === 'true',
				resourcesDescriptionVisible: template.find("[name='resourcesDescriptionVisible']").value.trim() === 'true',
			}
			
			Meteor.call('insertReport', reportPoperties, function(error, reportId) {
				if (error) {
					Alerts.insert({
						colorClass: 'bg-danger',
						iconClass: 'fss-danger',
						message: error.reason,
					});
					
					$('.js-saving').hide();
					$('.js-submit').prop('disabled', false);
				} else {
					FlowRouter.go('/reporting/view/2/' + Session.get('selectedStudentId') +'/'+ Session.get('selectedSchoolYearId') +'/'+ reportId);
				}
			});

			return false;
		}
	});
});



Template.reportingNew.helpers({
	selectedStudentId: function() {
		return Session.get('selectedStudentId');
	},

	selectedSchoolYearId: function() {
		return Session.get('selectedSchoolYearId');
	},

	selectedReportId: function() {
		return Session.get('selectedReportId');
	},
});

Template.reportingNew.events({
	'change .js-checkbox'(event) {
	    if ($(event.currentTarget).val() === 'true') {
	    	$(event.currentTarget).val('false');
	    } else {
	    	$(event.currentTarget).val('true');
	    }
	},

	'submit .js-form-reports-new'(event) {
		event.preventDefault();
	},
});