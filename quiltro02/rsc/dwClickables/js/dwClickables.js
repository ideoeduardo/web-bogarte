/*
	Class:    	dwClickables
	Author:   	David Walsh
	Website:    http://davidwalsh.name/
	Version:  	1.0.0
	Date:     	08/12/2008
	Built For:  MooTools 1.2
*/



var dwClickables = new Class({
	
	//implements
	Implements: [Options],

	//options
	options: {
		elements: $$('li'),
		selectClass: '',
		anchorToSpan: false
	},
	
	//initialization
	initialize: function(options) {
		//set options
		this.setOptions(options);
		//set clickable
		this.doClickables();
	},
	
	//a method that does whatever you want
	doClickables: function() {
		
		//for all of the elements
		this.options.elements.each(function(el) {
			
			//get the href
			var anchor = el.getElements('a' + (this.options.selectClass ? '.' + this.options.selectClass : ''))[0];
			
			//if we found one
			if($defined(anchor)) {
				
				//add a click event to the item so it goes there when clicked. 
				this.setClick(el,anchor.get('href'));
				
				//modify anchor to span if necesssary
				if(this.options.anchorToSpan) {
					var span = new Element('span',{
						text: anchor.get('text')
					}).replaces(anchor);
				}
			}
			
		},this);
	},
	
	//ads the click event
	setClick: function(element,href) {
		
		element.addEvent('click', function() {
			window.location = href;
		});
	}
	
});
