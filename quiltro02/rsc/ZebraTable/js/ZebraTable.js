
		
		var ZebraTable = new Class({
			//implements
			Implements: [Options,Events],
		
			//options
			options: {
				elements: 'table.list-table',
				cssEven: 'even',
				cssOdd: 'odd',
				cssHighlight: 'highlight',
				cssMouseEnter: 'mo'
			},
			
			//initialization
			initialize: function(options) {
				//set options
				this.setOptions(options);
				//zebra-ize!
				$$(this.options.elements).each(function(table) {
					this.zebraize(table);
				},this);
			},
			
			//a method that does whatever you want
			zebraize: function(table) {
				//for every row in this table...
				table.getElements('tr').each(function(tr,i) {
					//check to see if the row has th's
					//if so, leave it alone
					//if not, move on
					if(tr.getFirst().get('tag') != 'th') {
						//set the class for this based on odd/even
						var options = this.options, klass = i % 2 ? options.cssEven : options.cssOdd;
						//start the events!
						tr.addClass(klass).addEvents({
							//mouseenter
							mouseenter: function () {
								if(!tr.hasClass(options.cssHighlight)) tr.addClass(options.cssMouseEnter).removeClass(klass);
							},
							//mouseleave
							mouseleave: function () {
								if(!tr.hasClass(options.cssHighlight)) tr.removeClass(options.cssMouseEnter).addClass(klass);
							},
							//click 
							click: function() {
								//if it is currently not highlighted
								if(!tr.hasClass(options.cssHighlight))
									tr.removeClass(options.cssMouseEnter).addClass(options.cssHighlight);
								else
									tr.addClass(options.cssMouseEnter).removeClass(options.cssHighlight);
								//tr.toggleClass(options.cssMouseEnter).toggleClass(options.cssHighlight);
								//if(!tr.hasClass(options.cssHighlight)) tr.removeClass(options.cssMouseEnter);
							}
						});
					}
				},this);
			}
		});
 
		/* do it! */
		window.addEvent('domready', function() { 
			var zebraTables = new ZebraTable();
		});
		
