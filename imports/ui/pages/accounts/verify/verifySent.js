import {Template} from 'meteor/templating';
import './verifySent.html';


Template.verifySent.onRendered( function() {
	analytics.page(FlowRouter.getRouteName());
});