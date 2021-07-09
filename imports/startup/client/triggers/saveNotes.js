import {saveNote} from '../../../modules/functions';

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