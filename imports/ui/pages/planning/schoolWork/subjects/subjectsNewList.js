import {Template} from 'meteor/templating';
import './subjectsNewList.html';



Template.subjectsNewList.onCreated( function() {
	Session.setPersistent('unScrolled', true);
});