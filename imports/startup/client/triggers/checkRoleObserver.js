import _ from 'lodash';


// Redirection based on observer role.
function checkRoleObserver(context, redirect) {
	if (Meteor.user().info.role === 'Observer') {
		if (_.startsWith(context.route.name, 'users') || _.startsWith(context.route.name, 'billing')) {
			redirect('/settings/support/view/1');
		} else {
			redirect('/settings/users/restricted/2');
		}
	}
};

FlowRouter.triggers.enter([checkRoleObserver], {only: [
	'usersList',
	'usersNew',
	'usersVerifySent',
	'usersView',
	'usersEdit',
	'billingList',
	'billingInvoices',
	'billingEdit',
	'billingCoupons',
	'planningList',
	'studentsList',
	'studentsNew',
	'studentsView',
	'studentsEdit',
	'schoolYearsNew',
	'schoolYearsList',
	'schoolYearsView',
	'schoolYearsEdit',
	'resourcesList',
	'resourcesNew',
	'resourcesView',
	'resourcesEdit',
	'schoolWorkList',
	'workNew',
	'workView',
	'workEdit',
]});