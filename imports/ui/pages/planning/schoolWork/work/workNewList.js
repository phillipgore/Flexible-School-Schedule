import {Template} from 'meteor/templating';
import './workNewList.html';

Template.schoolWorkNewList.onCreated( function() {
	Session.setPersistent('unScrolled', true);
});