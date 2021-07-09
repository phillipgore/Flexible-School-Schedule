import '/imports/startup/client';

// Layouts
import '/imports/ui/layouts/app.js';
import '/imports/ui/layouts/office.js';
import '/imports/ui/layouts/notFound.js';

// Components
import '/imports/ui/components/toolbar.js';
import '/imports/ui/components/creditCard.js';
import '/imports/ui/components/navbar.js';
import '/imports/ui/components/editor.js';
import '/imports/ui/components/status.js';
	// Loaders
	import '/imports/ui/components/loaders/deleting.html';
	import '/imports/ui/components/loaders/loading.html';
	import '/imports/ui/components/loaders/loadingDropdown.html';
	import '/imports/ui/components/loaders/saving.html';
	import '/imports/ui/components/loaders/sendingEmail.html';
	import '/imports/ui/components/loaders/signingOut.html';
	import '/imports/ui/components/loaders/updating.html';
	import '/imports/ui/components/loaders/viewLoading.html';
	import '/imports/ui/components/loaders/lessonLoading.html';
	// Subbars
	import '/imports/ui/components/subbars/subbarAccounts.html';
	import '/imports/ui/components/subbars/subbarReporting.js';
	import '/imports/ui/components/subbars/subbarResources.js';
	import '/imports/ui/components/subbars/subbarSchoolWork.js';
	import '/imports/ui/components/subbars/subbarTracking.js';	


// Accounts
import '/imports/ui/pages/accounts/createAccount.js';
import '/imports/ui/pages/accounts/verify/verifySent.js';
import '/imports/ui/pages/accounts/verify/verifySuccess.js';
import '/imports/ui/pages/accounts/signIn.js';
import '/imports/ui/pages/accounts/reset/reset.js';
import '/imports/ui/pages/accounts/reset/resetSent.js';
import '/imports/ui/pages/accounts/reset/resetPassword.js';
import '/imports/ui/pages/accounts/reset/resetSuccess.js';
import '/imports/ui/pages/accounts/pausedUser.js';


// Office
import '/imports/ui/pages/office/toolbars/officeAccountsSubbar.js';
import '/imports/ui/pages/office/toolbars/officeToolbar.js';
import '/imports/ui/pages/office/toolbars/officeNavbar.js';
import '/imports/ui/pages/office/toolbars/officeAccountsSubbar.js';
import '/imports/ui/pages/office/dashboard/officeDashboard.js';
import '/imports/ui/pages/office/accounts/officeAccountsList.js';
import '/imports/ui/pages/office/accounts/officeAccountsEach.js';
import '/imports/ui/pages/office/accounts/officeAccountsView.js';
import '/imports/ui/pages/office/accounts/officeAccountsNew.js';
import '/imports/ui/pages/office/questions/officeQuestionsList.js';
import '/imports/ui/pages/office/questions/officeQuestionsView.js';
import '/imports/ui/pages/office/questions/officeQuestionsForm.js';


// Planning
import '/imports/ui/pages/planning/planningList.js';
	//School Years
	import '/imports/ui/pages/planning/schoolYears/schoolYearsNew.js';
	import '/imports/ui/pages/planning/schoolYears/schoolYearsList.js';
	import '/imports/ui/pages/planning/schoolYears/schoolYearsView.js';
	import '/imports/ui/pages/planning/schoolYears/schoolYearsEach.js';
	import '/imports/ui/pages/planning/schoolYears/schoolYearsEdit.js';
	// Resources
	import '/imports/ui/pages/planning/resources/resourcesForm.js';
	import '/imports/ui/pages/planning/resources/resourcesEdit.html';
	import '/imports/ui/pages/planning/resources/resourcesNew.html';
	import '/imports/ui/pages/planning/resources/resourcesList.js';
	import '/imports/ui/pages/planning/resources/resourcesEach.js';
	import '/imports/ui/pages/planning/resources/resourcesView.js';
	// School Work
	import '/imports/ui/pages/planning/schoolWork/schoolWorkList.js';
	import '/imports/ui/pages/planning/schoolWork/schoolWorkEach.js';
		// Work
		import '/imports/ui/pages/planning/schoolWork/work/workNew.js';
		import '/imports/ui/pages/planning/schoolWork/work/workNewList.js';
		import '/imports/ui/pages/planning/schoolWork/work/workView.js';
		import '/imports/ui/pages/planning/schoolWork/work/workEdit.js';
		// Subjects
		import '/imports/ui/pages/planning/schoolWork/subjects/subjectsNewList.js';
		import '/imports/ui/pages/planning/schoolWork/subjects/subjectsNew.js';
		import '/imports/ui/pages/planning/schoolWork/subjects/subjectsView.js';
		import '/imports/ui/pages/planning/schoolWork/subjects/subjectsEdit.js';
	// Students
	import '/imports/ui/pages/planning/students/studentsNew.js';
	import '/imports/ui/pages/planning/students/studentsList.js';
	import '/imports/ui/pages/planning/students/studentsView.js';
	import '/imports/ui/pages/planning/students/studentsEach.js';
	import '/imports/ui/pages/planning/students/studentsEdit.js';


// Tracking
import '/imports/ui/pages/tracking/trackingList.js';
import '/imports/ui/pages/tracking/trackingEach.js';
import '/imports/ui/pages/tracking/trackingSchoolWork.js';
import '/imports/ui/pages/tracking/trackingView.js';
import '/imports/ui/pages/tracking/trackingEditSchoolWork.js';
import '/imports/ui/pages/tracking/trackingEdit.js';



// Reporting
import '/imports/ui/pages/reporting/reportingList.js';
import '/imports/ui/pages/reporting/reportingNew.js';
import '/imports/ui/pages/reporting/reportingView.js';
import '/imports/ui/pages/reporting/reportingEach.js';
import '/imports/ui/pages/reporting/reportingEdit.js';
import '/imports/ui/pages/reporting/reports/reportingSchoolYears.js';
import '/imports/ui/pages/reporting/reports/reportingTerms.js';
import '/imports/ui/pages/reporting/reports/reportingSchoolWork.js';
import '/imports/ui/pages/reporting/reports/reportingResources.js';


// Settings
import '/imports/ui/pages/settings/settingsList.js';
	// Users
	import '/imports/ui/pages/settings/users/usersList.js';
	import '/imports/ui/pages/settings/users/usersNew.js';
	import '/imports/ui/pages/settings/users/usersEach.js';
	import '/imports/ui/pages/settings/users/usersView.js';
	import '/imports/ui/pages/settings/users/usersEdit.js';
	import '/imports/ui/pages/settings/users/usersRestricted.js';
	// Support
	import '/imports/ui/pages/settings/support/supportList.js';
	// Billing
	import '/imports/ui/pages/settings/billing/billingError.js';
	import '/imports/ui/pages/settings/billing/billingList.js';
	import '/imports/ui/pages/settings/billing/billingInvoices.js';
	import '/imports/ui/pages/settings/billing/billingEdit.js';
	import '/imports/ui/pages/settings/billing/billingCoupons.js'
	import '/imports/ui/pages/settings/billing/billingPause.js'
	// Data
	import '/imports/ui/pages/settings/testDataList.js';




