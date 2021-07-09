import './triggers/getInitialData.js';

import './triggers/checkPaymentError';
import './triggers/checkRoleAppAdminOrDev';
import './triggers/checkRoleObserver';
import './triggers/checkRoleUser.js';
import './triggers/checkSignOut';
import './triggers/checkSubscriptionPaused';
import './triggers/clearAlerts';
import './triggers/isAppAdmin';
import './triggers/resetSessions';
import './triggers/scrollReset';
import './triggers/setFramePosition';
import './triggers/saveNotes';

function saveNotesOnExit(context) {
	if (Session.get('hasChanged')) {
		Session.set('hasChanged', false);
		let schoolWorkId = $('.js-notes.js-open').attr('data-work-id');
		saveNote(schoolWorkId);
	}
};

FlowRouter.triggers.exit([saveNotesOnExit], {only: [
	'trackingView',
]});

import { FlowRouterTitle } from 'meteor/ostrio:flow-router-title';

	import './routes/accountRoutes.js';
	import './routes/planningRoutes.js';
	import './routes/trackingRoutes.js';
	import './routes/reportingRoutes.js';
	import './routes/settingsRoutes.js';
	import './routes/officeRoutes.js';
	
new FlowRouterTitle(FlowRouter);

FlowRouter.notFound = {
    name: 'notFound',
	action() {
		BlazeLayout.render('notFound');
	},
};

import moment from 'moment';
import {weekdayLabels, weekdayLabelsShort} from '../../modules/functions';

Accounts.onLogout(() => {
	Session.clear();
});

$(window).on('load', function (event) {
	Session.set({
		windowHeight: $(window).height(),
		windowWidth: $(window).width(),
	});
});

$(window).resize(function(event) {
	Session.set({
		windowHeight: $(window).height(),
		windowWidth: $(window).width(),
	});
});

Template.registerHelper('selectedFramePosition', () => {
  return Session.get('selectedFramePosition')
});

Template.registerHelper('dateFormat', (date) => {
	if (date) {
		return moment(date).format('MMMM D, YYYY');
	}
	return '';
});

Template.registerHelper('dateTimeFormat', (date) => {
	if (date) {
	  return moment(date).format('MMMM D, YYYY - h:mm A');
	}
	return '';
});

Template.registerHelper('shortDateFormat', (date) => {
	if (date) {
	  return moment(date).format('M/D/YY');
	}
	return '';
});

Template.registerHelper('stripeDateFormat', (date) => {
	if (date) {
	  return moment.unix(date).format('M/D/YY');
	}
	return '';
});

Template.registerHelper('age', (date) => {
	let years = moment().diff(date, 'years');
	if (years === 1) {
		return years + ' Year Old';
	}
	return years + ' Years Old';
});

Template.registerHelper('sPlural', (number) => {
	if (number === 1) {
		return '';
	}
	return 's';
});

Template.registerHelper('esPlural', (number) => {
	if (number === 1) {
		return '';
	}
	return 'es';
});

Template.registerHelper('centsToDollars', (cents) => {
  return '$' + (cents / 100).toFixed(2);
});

Template.registerHelper('weekDays', ( day ) => {
	return weekdayLabels(day);
});

Template.registerHelper('weekDaysShort', (day) => {
	return weekdayLabelsShort(day);
});









