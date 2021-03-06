import {Template} from 'meteor/templating';
import './editor.html';
import strip from 'strip';
import stripTags from 'striptags';
import insertTextAtCursor from 'insert-text-at-cursor';

Template.editor.onCreated( function() {
	let template = Template.instance();
	template.editorId = new ReactiveVar(Random.id());
});

Template.editor.onRendered( function() {
	let template = Template.instance();

	template.autorun( () => {
		let existingContent = Template.currentData().existingContent;
		$('#' + template.editorId.get()).html(existingContent)
	})

	Session.set(template.editorId.get(), $('#' + template.editorId.get()).html());

	document.execCommand('defaultParagraphSeparator', false, 'p');
	document.execCommand('styleWithCSS', false, null);
});

Template.editor.helpers({
	editorId: function() {
		return Template.instance().editorId.get();
	},

	content: function() {
		return Session.get(Template.instance().editorId.get())
	}
});

Template.editor.events({
	'click .js-editor-btn'(event, template) {
		event.preventDefault();

		let command = $(event.currentTarget).attr('data-command');
		if ($(event.currentTarget).hasClass('js-link-btn')) {
			let href = document.getSelection().anchorNode.parentElement.href
			const url = prompt("Enter the URL", href);
			if (url != null && url.length >= 1) {
				document.execCommand(command, false, url);
				$('#' + template.editorId.get() + ' a[href="' + url + '"').attr('target', '_blank');
				$('#' + template.editorId.get()).focus();
				let newHref = document.getSelection().anchorNode.parentElement.href
				$('.js-btn-go-to').attr('href', newHref).show();
			} else if (url != null && url.length <= 0) {
				document.execCommand('unlink', false, '');
				$('#' + template.editorId.get()).focus();
			}
		} else {
			document.execCommand(command, false, '');
			$('#' + template.editorId.get()).focus();
		}
	},

	'click .editor-content, keyup .editor-content, click .js-editor-btn'(event, template) {
		event.preventDefault();

		if (document.getElementById(template.editorId.get()).firstChild && document.getElementById(template.editorId.get()).firstChild.nodeType === 3) {
			document.execCommand('formatBlock', false, '<p>')
		}

		if (document.queryCommandState('bold')) {
			$('.js-bold-btn').addClass('active');
		} else {
			$('.js-bold-btn').removeClass('active');
		}

		if (document.queryCommandState('italic')) {
			$('.js-italic-btn').addClass('active');
		} else {
			$('.js-italic-btn').removeClass('active');
		}

		if (document.queryCommandState('underline')) {
			$('.js-underline-btn').addClass('active');
		} else {
			$('.js-underline-btn').removeClass('active');
		}

		if (window.getSelection().anchorNode.parentElement.tagName.toLowerCase() === 'a') {
			const href = window.getSelection().anchorNode.parentElement.href
			$('.js-btn-go-to').attr('href', href).show();
			$('.js-link-btn').addClass('active');
			$('.js-unlink-btn').addClass('active');
			$('.js-underline-btn').removeClass('active');
		} else {
			$('.js-btn-go-to').hide();
			$('.js-link-btn').removeClass('active');
			$('.js-unlink-btn').removeClass('active');
		}

		if (document.queryCommandState('insertUnorderedList')) {
			$('.js-ul-btn').addClass('active');
		} else {
			$('.js-ul-btn').removeClass('active');
		}

		if (document.queryCommandState('insertOrderedList')) {
			$('.js-ol-btn').addClass('active');
		} else {
			$('.js-ol-btn').removeClass('active');
		}

		let content = $('#' + template.editorId.get()).html();
		if (strip(content).length) {
			Session.set(template.editorId.get(), content);
		} else {
			Session.set(template.editorId.get(), '');
		}
	},

	'keyup .editor-content'(event, template) {
		if (!$(event.currentTarget).text().length) {
			$(event.currentTarget).html('');
			$('.js-bold-btn').removeClass('active');
			$('.js-italic-btn').removeClass('active');
			$('.js-underline-btn').removeClass('active');
			$('.js-link-btn').removeClass('active');
			$('.js-ul-btn').removeClass('active');
			$('.js-ol-btn').removeClass('active');
		}
	},

	'paste .editor-content'(event, template) {
		event.preventDefault();
		let text = (event.originalEvent || event).clipboardData.getData('text/html');
		let paste = stripTags(text, [ 'p', 'ol', 'ul', 'li', 'a', 'span' ], '<p>')
		pasteHtmlAtCaret(paste);
	}
});

const pasteHtmlAtCaret = html => {
    var sel, range;
    if (window.getSelection) {
        // IE9 and non-IE
        sel = window.getSelection();
        if (sel.getRangeAt && sel.rangeCount) {
            range = sel.getRangeAt(0);
            range.deleteContents();

            // Range.createContextualFragment() would be useful here but is
            // non-standard and not supported in all browsers (IE9, for one)
            var el = document.createElement("div");
            el.innerHTML = html;
            var frag = document.createDocumentFragment(), node, lastNode;
            while ( (node = el.firstChild) ) {
                lastNode = frag.appendChild(node);
            }
            range.insertNode(frag);
            
            // Preserve the selection
            if (lastNode) {
                range = range.cloneRange();
                range.setStartAfter(lastNode);
                range.collapse(true);
                sel.removeAllRanges();
                sel.addRange(range);
            }
        }
    } else if (document.selection && document.selection.type != "Control") {
        // IE < 9
        document.selection.createRange().pasteHTML(html);
    }
}






