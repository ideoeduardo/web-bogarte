/*
Script: dropMenu.js
	Drop menu going Nth levels

License:
	MIT-style license.

Author:
	Copyright (c) 2008 Chris Esler, <http://www.chrisesler.com/mootools>

*/
// Also known as IE fix
var TridentFix = new Class({
	tridentFix: function(item){
		item.addEvents({
			'mouseover':function(){
				this.addClass('iehover');
			},
			'mouseout':function(){
				this.removeClass('iehover');
			}
		});
	}
});


var DropMenu = new Class({
	Implements: [Options,TridentFix],
	/* 
		don't know about options yet
		but set it up anyways just in case 
	*/
	options: {
		mode: 'horizontal'
	},
	menu: null,
	initialize: function(menu,options){
		if(options) this.setOptions(options);
	
		this.menu = $(menu);
		
		// grab all of the menus children - LI's in this case
		var children = this.menu.getChildren();
		
		// loop through children
		children.each(function(item,index){
			// declare some variables 
			var fChild, list;
			
			/* 
				fChild = first child - which should be an A tag
				list = submenu UL
			*/
			fChild = item.getFirst();
			list = fChild.getNext('ul');
			
			// check if IE, if so apply fix
			if(Browser.Engine.trident) this.tridentFix(item);
			
			// if there is a sub menu UL
			if(list){
				item.mel = list; // pel = parent element
				list.pel = item; // mel = menu element
				new SubMenu(list); // hook up the subMenu
			}
		},this); // binding loop to this object for trident fix

	}	
});



var SubMenu = new Class({
	Implements: [Options,TridentFix],
	/* 
		don't know about options yet
		but set it up anyways just in case 
	*/
	options: {
		mode: 'vertical'
	},
	menu: null, // storage for menu object
	depth: 0, // storage for current menu depth
	initialize: function(el,depth,options){
		if(options) this.setOptions(options); // set options
		if(depth) this.depth = depth;// set depth
		
		this.menu = el; //attach menu to object
		
		if(this.depth == 0)	this.menu.addClass('submenu'); // class for first level
		if(this.depth >= 1)	this.menu.addClass('sub_submenu'); // class for deeper levels - in case :P
		
		this.menu.fade('hide'); // set menu to hid

		/*
			hook up menu's parent with event
			to trigger menu
		*/
		this.menu.pel.addEvents(this.parentEvents); 
		
		// get menu's child elements
		var children = this.menu.getChildren();
			
		// loop through children
		children.each(function(item,index){
			// declare some variables 
			var fChild, list;
			
			/* 
				fChild = first child - which should be an A tag
				list = submenu UL
			*/
			fChild = item.getFirst();
			list = fChild.getNext('ul');
			
			// check if IE, if so apply fix
			if(Browser.Engine.trident) this.tridentFix(item);
			
			// if the menu item has a sub_submenu
			if(list){
				/*
					create marker for menu item
					that has a sub_submenu
					this is to show persistence and 
					where you are in the menu tree
				*/
				var count = new Element('span').set('html','\&raquo;').addClass('counter');
				
				item.adopt(count); // stuff it inside li
				count.fade('hide'); // hide it

				item.mel = list; // mel = menu element
				item.count = count; // attach count accessor to menu item
				list.pel = item; // pel = parent element
				
				// create new subMenu with depth incremented
				new SubMenu(list,this.depth+1);
			}
		},this); //bound to this for trident fix
	},
	// menu parent mouse events
	parentEvents: {
		'mouseover': function(){
			/*
				if it has a count accesor
				then fade it in 
			*/
			if(this.count) this.count.fade('in');
			
			// fade in menu
			this.mel.fade('in');		
		},
		'mouseout': function(){
			/*
				if it has a count accesor
				then fade it out 
			*/
			if(this.count) this.count.fade('out');
			
			// fade out menu
			this.mel.fade('out');
		}
	}
});
