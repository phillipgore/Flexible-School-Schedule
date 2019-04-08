FlowRouter.route('/tracking/students/view/:selectedFramePosition/:selectedStudentId/:selectedSchoolYearId/:selectedTermId/:selectedWeekId', {
	name: 'trackingView',
	action(params) {
		BlazeLayout.render('app', {
			subbar: 'subbarTracking',
			frameOne: 'trackingList',
			frameTwo: 'trackingView',
		});
		if (Meteor.settings.public.routeLoggingOn) {
			Meteor.call('logRoute', Meteor.userId(), 'trackingView')
		}
	},
});














