/*
 *
 *	HotText (Update Sequential Data by Dragging)
 *
 *	Version: 1.1
 *	Documentation: AndrewPlummer.com (http://www.andrewplummer.com/code/hottext/)
 *	Inspired by: Adobe After Effects
 *	Written for: Mootools 1.2
 *	License: MIT-style License
 *	
 *	Copyright (c) 2008 Andrew Plummer
 *
 *
 */

var HotText = new Class({

	Implements: Options,

	options: {
	
		snapTo: 75,
		range: [-Infinity, Infinity],
		autoSubmit: false,
		autoCheckbox: false,
		commas: true
		
	},

	initialize: function(css, options){
		
		this.setOptions(options);
		this.items = $$(css);
		
		this.items.each(function(item, index){
		
			var num = index + 1;
			var span  = this.requireElement("span", item, "A <span> element is required. (Item "+num+")");
			var input = this.requireElement("input,select", item, "An <input> or <select> element is required. (Item "+num+")");
			var tag = input.get("tag");
			
			this.form = $(input.form);
	
			if(tag == "input"){
			
				var text = span.get("text");
				var prefix = text.match(/^\D+/);
				if(prefix) span.store("prefix", prefix.toString());
				var suffix = text.match(/\D+$/);
				if(suffix) span.store("suffix", suffix.toString());
				var value = input.get("value").replace(/[,:]/g, "");
				if(!value) value = "0";
				var match = value.match(/[-+]?\d*\.?\d+/);
				if(match) span.store("value", match[0]);
				else this.throwError("<input> elements must be numeric. (Item "+num+")");
				
			} else {
				span.store("value", input.selectedIndex);
			}
			
			span.addEvent("click", function(event){
	
				span.setStyle("display", "none");
				input.setStyle("display", "inline");
				if(tag == "input") input.select();
				else input.focus();
			
			}.bindWithEvent(this));
						

			input.addEvent("blur", this.hideInput.pass([input, span]));
			input.addEvent("change", this.checkChange.bind(this, [span, input]));
			
			span.setStyle("cursor", "pointer");
			span.setStyle("display", "inline");
			
			input.setStyle("display", "none");
			
			span.drag = new Drag(span, {
			
				onStart: function(span){
				
					$(document.body).addClass("hotTextDrag");
					span.setStyle("cursor", "e-resize");
					
				},
				onDrag: function(span){
					
					var mouseOffset   = span.drag.mouse.start.x - span.drag.mouse.now.x;
					var elementOffset = -Math.round(mouseOffset / this.options.snapTo);				
					
					if(input.get("tag") == "select"){
					
						var index = input.selectedIndex + elementOffset;
						if(index < 0 || index > input.length - 1) return;
						input.store("setValue", index);
						var text = input[index].text;
						
					} else {
						var value = input.get("value");
						if(!value) value = 0;
						value = value.toInt() + elementOffset;
						value = this.limitNumber(value);
						input.store("setValue", value);
						var text = this.formatNumber(value, span);
					}
					
					span.set("text", text);
					
				}.bind(this),
				
				onComplete: function(span){

					var setValue = input.retrieve("setValue");
					if(input.get("tag") == "select") input.selectedIndex = setValue;
					else input.set("value", setValue);
					$(document.body).removeClass("hotTextDrag");
					span.setStyle("cursor", "pointer");
					if(input.retrieve("tridentSelect")) input.fireEvent("blur");
					else input.fireEvent("change");
										
				}.bind(this),
				style: false
			});

		}, this);
	},
	
	checkChange: function(span, input){
				
		if(input.get("tag") == "input"){
		
			var newValue = input.get("value").toInt();
			var oldValue = span.retrieve("value");
			
			var limited = this.limitNumber(newValue);
			if(limited != newValue){
				newValue = limited;
				input.set("value", limited);
			}
			var formatted = this.formatNumber(newValue, span);
			
		} else {
		
			var newValue = input.selectedIndex;
			var oldValue = span.retrieve("value");
			
			var formatted = input.getSelected()[0].text;
		}
		
		var changed = (newValue == oldValue) ? false : true;
		

		if(changed){
			span.store("value", newValue);
			var text = span.get("text");
			if(formatted != text) span.set("text", formatted);
			this.initSubmit(input);
		}
	},
	
	hideInput: function(input, span){
	
		input.setStyle("display", "none");
		span.setStyle("display", "inline");
	},
	
	initSubmit: function(input){
		
		if(this.options.autoCheckbox){
		
			var key = input.name.match(/\d+/g);
			
			if(key){
				key = key[0];
				var box = this.form.getElements("input[name^=edit]").filter("[value="+key+"]");
				box.set("checked", true);
			}
		}
		
		if(this.options.autoSubmit) this.form.submit();
	},
	
	limitNumber: function(number){
	
		var min = this.options.range[0];
		var max = this.options.range[1];
		
		if(isNaN(number) || number < min) return min;
		else if(number > max) return max;
		else return number;
	},
	
	formatNumber: function(number, span){
	
		if(!number) return null;
		number = number.toString();
		if(this.options.commas) number = this.padNumber(number);
		var prefix = span.retrieve("prefix");
		if(prefix) number = prefix + number;
		var suffix = span.retrieve("suffix");
		if(suffix) number = number + suffix;
		return number;	
	},
	
	padNumber: function(number){
	
		if(number.length < 3) return number;
		var padded = "";		
		for(i=1;i<=number.length;i++){
			var num = number.length - i;
			var add = ((i % 3 == 0) && num != 0) ? "," + number.charAt(num) : number.charAt(num);
			padded = add + padded;
		}
		return padded;
	},
	
	requireElement: function(css, parent, error, exclude){
		
		var elements = parent.getElements(css);
		if(!elements.length) this.throwError(error);
		var match;
		elements.each(function(element){
			if(element.hasClass(exclude)) return;
			else match = element; 
		});
		return match;
	},
	
	throwError: function(error){
	
		var exception = "HotText Error: " + error;
		alert(exception);
		throw new Error(exception);
	}
});

/* This is injected outside the class definition because we don't 
   want multiple style elements for each instance of HotText */

window.addEvent("domready", function(){

	if(document.createStyleSheet){

		var newCSS = document.createStyleSheet();
		newCSS.addRule("body.hotTextDrag *", "cursor:e-resize!important;");
		
	} else {
	
		var newCSS = new Element("style", {
			"type": "text/css",
			"text": "body.hotTextDrag * {cursor:e-resize!important;}"
		}).inject(document.head);
	}
});
