Accounts.config({
  sendVerificationEmail: true,
});

Accounts.emailTemplates = {
	from: 'All Natural Contact <no-reply@flexibleschoolschedule.com>',
	siteName: 'Flexible School Schedule',

	resetPassword: {
		subject: function(user, url) {
			return 'Reset your password for ' + Accounts.emailTemplates.siteName + '.';
		},
		text: function(user, url) {
			url = url.replace('#/reset-password/', 'reset/password/')
			firstName = user.info.firstName
			return firstName + ',\n\n Sorry you forgot your password. Click the link below and we’ll help you get a new one.\n\n\t' + url + '\n\nIf you didn\'t request a password reset, please ignore this email. \n\nThanks.';
	    }
	},

	verifyEmail: {
		subject: function(user, url) {
			return 'Please verify email address for ' + Accounts.emailTemplates.siteName + '.';
		},
		text: function(user, url) {
			url = url.replace('#/verify-email/', 'verify/email/')
			firstName = user.info.firstName
			return firstName + ',\n\n Welcome to Flexible School Schedule. We need to verify your email address to complete your signup. Please click the verification link below.\n\n\t' + url + '\n\nIf you have not signed up for Flexible School Schedule, please ignore this email. \n\nThanks.';
		}
	}
};

Accounts.onCreateUser((options, user) => {
	if (options.info) {
		user.info = options.info;
	}
	if (options.group) {
		user.group = options.group;
	}
	if (options.status) {
		user.status = options.status;
	}
	return user;
});

Accounts.validateLoginAttempt(function(login) {
	if (login.user && login.user.emails && !login.user.emails[0].verified ) {
		throw new Meteor.Error(500, 'unverified');
	}
	return true;
});