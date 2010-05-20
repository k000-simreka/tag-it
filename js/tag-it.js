(function($) {

	$.fn.tagit = function(options) {

		var el = this;

		const BACKSPACE		= 8;
		const ENTER			= 13;
		const SPACE			= 32;
		const COMMA			= 44;
		const TAB			= 9;

		// option defaults
		if (!options.itemName) options.itemName = 'item';
		if (!options.fieldName) options.fieldName = 'tags';

		// add the tagit CSS class.
		el.addClass("tagit");

		// create the input field.
		var html_input_field = "<li class=\"tagit-new\"><input class=\"tagit-input\" type=\"text\" /></li>\n";
		el.append (html_input_field);

		tag_input		= el.children(".tagit-new").children(".tagit-input");

		// add existing tags
		el.children("li").each(function(){
			if (!$(this).hasClass('tagit-new')) {
				create_choice($(this).html());
				$(this).remove();
			}
		});

		$(this).click(function(e){
			if (e.target.tagName == 'A') {
				// Removes a tag when the little 'x' is clicked.
				// Event is binded to the UL, otherwise a new tag (LI > A) wouldn't have this event attached to it.
				$(e.target).parent().remove();
			}
			else {
				// Sets the focus() to the input field, if the user clicks anywhere inside the UL.
				// This is needed because the input field needs to be of a small size.
				tag_input.focus();
			}
		});

		tag_input.keypress(function(event){
			keyCode = event.keyCode || event.which;
			if (keyCode == BACKSPACE) {
				if (tag_input.val() == "") {
					// When backspace is pressed, the last tag is deleted.
					$(el).children(".tagit-choice:last").remove();
				}
			}
			// Comma/Space/Enter are all valid delimiters for new tags. except when there is an open quote
			else if (
					keyCode == COMMA || 
					keyCode == ENTER || 
					keyCode == TAB ||
					(
						keyCode == SPACE &&
						( 
							(tag_input.val().trim().replace( /^s*/, "" ).charAt(0) != '"') ||
							(
								tag_input.val().trim().charAt(0) == '"' && 
								tag_input.val().trim().charAt(tag_input.val().trim().length - 1) == '"' && 
								tag_input.val().trim().length - 1 != 0
							)
						)
					)
				) {
				
				event.preventDefault();

				var typed = tag_input.val();
				typed = typed.replace(/,+$/,"").trim().replace(/^"/, "").replace(/"$/, "");
				typed = typed.trim();

				if (typed != "") {
					if (is_new (typed)) {
						create_choice (typed);
					}
					// Cleaning the input.
					tag_input.val("");
				}
			}
		});

		tag_input.autocomplete({
			source: function(search, show_choices){
			  var filter = new RegExp(search.term, "i");
				var choices = options.availableTags.filter(function(element) {
					return (element.search(filter) != -1);
				});

				show_choices(subtract_array(choices,assigned_tags()));
			},
			select: function(event,ui){
				if (is_new (ui.item.value)) {
					create_choice (ui.item.value);
				}
				// Cleaning the input.
				tag_input.val("");

				// Preventing the tag input to be updated with the chosen value.
				return false;
			}
		});

		function assigned_tags(){
			var tags = [];
			this.tag_input.parents("ul").children(".tagit-choice").each(function(){
				tags.push($(this).children("input").val());
			});
			return tags;
		}

		function subtract_array(a1,a2){
			var result = new Array();
			for(var i in a1) {
				if (a2.indexOf(a1[i]) == -1) {
					result.push(a1[i]);
				}
			}
			return result;
		}

		function is_new (value){
			var is_new = true;
			this.tag_input.parents("ul").children(".tagit-choice").each(function(i){
				n = $(this).children("input").val();
				if (value == n) {
					is_new = false;
				}
			});
			return is_new;
		}
		function create_choice (value){
			var el = "";
			el  = "<li class=\"tagit-choice\">\n";
			el += value + "\n";
			el += "<a class=\"close\">x</a>\n";
			el += "<input type=\"hidden\" style=\"display:none;\" value=\""+value+"\" name=\"" + options.itemName + "[" + options.fieldName + "][]\">\n";
			el += "</li>\n";
			var li_search_tags = this.tag_input.parent();
			$(el).insertBefore (li_search_tags);
			this.tag_input.val("");
		}
	};

	String.prototype.trim = function() {
		return this.replace(/^\s+|\s+$/g,"");
	};

})(jQuery);
