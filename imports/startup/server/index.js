Inject.rawBody("loader", Assets.getText('loading.html'));

let googleTagHead = '';
let googleTagBody = '';

if (Meteor.settings.public.mode === 'prod') {
	googleTagHead = `
	<!-- Google Tag Manager -->
	<script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
	new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
	j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
	'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
	})(window,document,'script','dataLayer','GTM-PRN8WFN');</script>
	<!-- End Google Tag Manager -->`;
}

if (Meteor.settings.public.mode === 'prod') {
	googleTagBody = `
	<!-- Google Tag Manager (noscript) -->
	<noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-PRN8WFN"
	height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>
	<!-- End Google Tag Manager (noscript) -->`;
}

Inject.rawHead('GoogleTagHead', googleTagHead);
Inject.rawBody('GoogleTagBody', googleTagBody);


import { ReactiveVar } from 'meteor/reactive-var';
import './browser-policy.js';
import './accounts.js';
import './admin.js';
import './stripe.js';
import './mailchimp.js';
import './migrations.js';
import './endpoints.js';
import './cron.js';

import './fixtures/studentFixtures.js';
import './fixtures/schoolYearFixtures.js';
import './fixtures/resourceFixtures.js';
import './fixtures/schoolWorkFixtures.js';
import './fixtures/lessonFixtures.js';
import './fixtures/removeFixtures.js';

import '../../api/answers/answers.js';
import '../../api/answers/methods.js';
import '../../api/answers/server/publications.js';

import '../../api/groups/groups.js';
import '../../api/groups/methods.js';
import '../../api/groups/server/publications.js';

import '../../api/lessons/lessons.js';
import '../../api/lessons/methods.js';
import '../../api/lessons/server/publications.js';

import '../../api/notes/notes.js';
import '../../api/notes/methods.js';
import '../../api/notes/server/publications.js';

import '../../api/office/methods.js';
import '../../api/office/server/publications.js';

import '../../api/paths/paths.js';
import '../../api/paths/methods.js';
import '../../api/paths/server/publications.js';

import '../../api/questions/questions.js';
import '../../api/questions/methods.js';
import '../../api/questions/server/publications.js';

import '../../api/reports/reports.js';
import '../../api/reports/methods.js';
import '../../api/reports/server/publications.js';

import '../../api/resources/resources.js';
import '../../api/resources/methods.js';
import '../../api/resources/server/publications.js';

import '../../api/subjects/subjects.js';
import '../../api/subjects/methods.js';
import '../../api/subjects/server/publications.js';

import '../../api/schoolWork/schoolWork.js';
import '../../api/schoolWork/methods.js';
import '../../api/schoolWork/server/publications.js';

import '../../api/schoolYears/schoolYears.js';
import '../../api/schoolYears/methods.js';
import '../../api/schoolYears/server/publications.js';

import '../../api/stats/stats.js';
import '../../api/stats/methods.js';
import '../../api/stats/server/publications.js';

import '../../api/students/students.js';
import '../../api/students/methods.js';
import '../../api/students/server/publications.js';

import '../../api/users/methods.js';
import '../../api/users/server/publications.js';

import '../../api/terms/terms.js';
import '../../api/terms/methods.js';
import '../../api/terms/server/publications.js';

import '../../api/weeks/weeks.js';
import '../../api/weeks/methods.js';
import '../../api/weeks/server/publications.js';



