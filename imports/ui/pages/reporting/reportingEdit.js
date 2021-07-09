import { Template } from 'meteor/templating';
import { Reports } from '../../../api/reports/reports.js';
import './reportingEdit.html';

Template.reportingEdit.onCreated( function() {	
	// Subscriptions
	this.subscribe('report', FlowRouter.getParam('selectedReportId'));	
});

Template.reportingEdit.onRendered( function() {
	let template = Template.instance();

	Session.set({
		toolbarType: 'edit',
		labelTwo: 'Edit Report',
		activeNav: 'reportingList',
	});

	// Form Validation and Submission
	$('.js-form-report-update').validate({
		rules: {
			name: { required: true },
		},
		messages: {
			name: { required: "Required." },
		},		

		submitHandler() {
			$('.js-updating').show();
			$('.js-submit').prop('disabled', true);

			let reportProperties = {
				_id: template.find("[name='_id']").value.trim(),
				name: template.find("[name='name']").value.trim(),
				weekEquals: template.find("[name='weekEquals']").value.trim(),
				
				schoolYearReportVisible: template.find("[name='schoolYearReportVisible']").value.trim() === 'true',
				schoolYearStatsVisible: template.find("[name='schoolYearStatsVisible']").value.trim() === 'true',
				schoolYearProgressVisible: template.find("[name='schoolYearProgressVisible']").value.trim() === 'true',
				schoolYearCompletedVisible: template.find("[name='schoolYearCompletedVisible']").value.trim() === 'true',
				schoolYearTimesVisible: template.find("[name='schoolYearTimesVisible']").value.trim() === 'true',
				
				termsReportVisible: template.find("[name='termsReportVisible']").value.trim() === 'true',
				termsStatsVisible: template.find("[name='termsStatsVisible']").value.trim() === 'true',
				termsProgressVisible: template.find("[name='termsProgressVisible']").value.trim() === 'true',
				termsCompletedVisible: template.find("[name='termsCompletedVisible']").value.trim() === 'true',
				termsTimesVisible: template.find("[name='termsTimesVisible']").value.trim() === 'true',
				
				schoolWorkReportVisible: template.find("[name='schoolWorkReportVisible']").value.trim() === 'true',

				subjectReportVisible: template.find("[name='subjectReportVisible']").value.trim() === 'true',
				subjectStatsVisible: template.find("[name='subjectStatsVisible']").value.trim() === 'true',
				subjectProgressVisible: template.find("[name='subjectProgressVisible']").value.trim() === 'true',
				subjectCompletedVisible: template.find("[name='subjectCompletedVisible']").value.trim() === 'true',
				subjectTimesVisible: template.find("[name='subjectTimesVisible']").value.trim() === 'true',

				workReportVisible: template.find("[name='workReportVisible']").value.trim() === 'true',
				schoolWorkStatsVisible: template.find("[name='schoolWorkStatsVisible']").value.trim() === 'true',
				schoolWorkProgressVisible: template.find("[name='schoolWorkProgressVisible']").value.trim() === 'true',
				schoolWorkTimesVisible: template.find("[name='schoolWorkTimesVisible']").value.trim() === 'true',
				schoolWorkDescriptionVisible: template.find("[name='schoolWorkDescriptionVisible']").value.trim() === 'true',
				schoolWorkResourcesVisible: template.find("[name='schoolWorkResourcesVisible']").value.trim() === 'true',

				timesPerWeekReportVisible: template.find("[name='timesPerWeekReportVisible']").value.trim() === 'true',
				timesPerWeekProgressVisible: template.find("[name='timesPerWeekProgressVisible']").value.trim() === 'true',

				resourcesReportVisible: template.find("[name='resourcesReportVisible']").value.trim() === 'true',
				resourcesOriginatorVisible: template.find("[name='resourcesOriginatorVisible']").value.trim() === 'true',
				resourcesPublicationVisible: template.find("[name='resourcesPublicationVisible']").value.trim() === 'true',
				resourcesSchoolWorkVisible: template.find("[name='resourcesSchoolWorkVisible']").value.trim() === 'true',
				resourcesLinkVisible: template.find("[name='resourcesLinkVisible']").value.trim() === 'true',
				resourcesDescriptionVisible: template.find("[name='resourcesDescriptionVisible']").value.trim() === 'true',
			}
			
			Meteor.call('updateReport', reportProperties._id, reportProperties, function(error) {
				if (error) {
					Alerts.insert({
						colorClass: 'bg-danger',
						iconClass: 'icn-danger',
						message: error.reason,
					});
					
					$('.js-updating').hide();
					$('.js-submit').prop('disabled', false);
				} else {
					FlowRouter.go('/reporting/view/1/' + Session.get('selectedStudentId') +"/"+ Session.get('selectedSchoolYearId') +'/'+ Session.get('selectedReportingTermId') +'/'+ Session.get('selectedReportingWeekId') +"/"+ Session.get('selectedReportId'));
				}
			});

			return false;
		}
	});
});

Template.reportingEdit.helpers({
	user: function() {
		return Meteor.user();
	},

	report: function() {
		return Reports.findOne(FlowRouter.getParam('selectedReportId'));
	},

	selectedSchoolYearId: function() {
		return Session.get('selectedSchoolYearId');
	},

	selectedStudentId: function() {
		return Session.get('selectedStudentId');
	},

	days: function() {
		return [1, 2, 3, 4, 5, 6, 7]
	},

	selectedDays: function(number) {
		let report = Reports.findOne(FlowRouter.getParam('selectedReportId')) && Reports.findOne(FlowRouter.getParam('selectedReportId'));
		if (number === report.weekEquals) {
			return 'selected';
		}
		return null;
	},

	weekEquals: function() {
		return Session.get('weekEquals');
	}
});

Template.reportingEdit.events({
	'change .js-week-equals-days'(event, template) {
		Session.set('weekEquals', parseInt(template.find("[name='weekEquals']").value.trim()));
	},

	'change .js-checkbox'(event) {
	    if ($(event.currentTarget).val() === 'true') {
	    	$(event.currentTarget).val('false');
	    } else {
	    	$(event.currentTarget).val('true');
	    }
	},

	'submit .js-form-report-update'(event) {
		event.preventDefault();
	},

	'click .js-cancel'(event) {
		event.preventDefault();

		if (window.screen.availWidth > 768) {
			FlowRouter.go('/reporting/view/2/' + Session.get('selectedStudentId') +"/"+ Session.get('selectedSchoolYearId') +'/'+ Session.get('selectedReportingTermId') +'/'+ Session.get('selectedReportingWeekId') +"/"+ FlowRouter.getParam('selectedReportId'))
		} else {
			FlowRouter.go('/reporting/view/1/' + Session.get('selectedStudentId') +"/"+ Session.get('selectedSchoolYearId') +'/'+ Session.get('selectedReportingTermId') +'/'+ Session.get('selectedReportingWeekId') +"/"+ FlowRouter.getParam('selectedReportId'))
		}

	},
});