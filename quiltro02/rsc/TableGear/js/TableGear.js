/*
 *
 *	TableGear (Dynamic table data in HTML)
 *
 *	Version: 1.2
 *	Documentation: AndrewPlummer.com (http://www.andrewplummer.com/code/tablegear/)
 *	Inspired by: TableKit for Prototype (http://www.millstream.com.au/view/code/tablekit/)
 *	Written for: Mootools 1.2
 *	License: MIT-style License
 *	
 *	Copyright (c) 2009 Andrew Plummer
 *
 *
 */


var TableGear = new Class({

	Implements: Options,

	options: {
		hideInputs: true,
		rowStriping: true,
		autoSelect: true,
		shortcutKeys: true,
		ascCarat: "▲",
		descCarat: "▼",
		deletePrompt: "Delete this row?",
		noDataMessage: "- No Data -",
		taskMaster: -1
	},

	initialize: function(id, options){
	
		this.setOptions(options);
		
		var el = $(id);
		
		if(!el){
			this.throwError("Element '"+id+"' does not exist.");
		} else if(el.get("tag") == "form"){
			var form = el;
			var table = this.requireElement("table", form, "A <table> element is required inside <form> '"+id+"'.");
		} else if(el.get("tag") == "table"){
			var form = el.getParent("form");
			var table = el;
		} else if(el.get("tag") != "table"){
			this.throwError("Element '"+id+"' must be a <table> or <form>.");
		}
		
		if(form){
			this.url = (this.options.url) ? this.options.url : form.get("action");
			var submitButton = form.getElement("input[type=submit]");
			if(submitButton) submitButton.setStyle("display", "none");
		}
		
		var thead = this.requireElement("thead", table, "Element <thead> is required inside <table>.");
		this.headerRow = this.requireElement("tr", thead, "A <tr> element is required inside <thead>.", "title");
		this.headers = this.headerRow.getChildren("th");
		
		this.headers.each(function(header, colIndex){
				
			if(!header.hasClass("sortable")) return;
					
			if(header.hasClass("date")) header.store("colType", "date");
			else if(header.hasClass("eDate")) header.store("colType", "eDate");
			else if(header.hasClass("memory")) header.store("colType", "memory");
			else if(header.hasClass("alphabetic")) header.store("colType", "string");
			else header.store("colType", "numeric");
				
			header.store("colIndex", colIndex);
			header.carat = new Element("span", {"class": "carat"}).inject(header);
				
			header.addEvent("click", function(event){
				
				var colIndex = header.retrieve("colIndex");
				if(this.currentIndex == colIndex){
					this.currentDesc = (this.currentDesc) ? false : true;
				} else {
					this.currentIndex = colIndex;
					this.currentDesc = false;
				}
				
				this.currentIndex = colIndex;
				this.currentType  = header.retrieve("colType");
				
				
				this.sortRows();						
			
			}.bindWithEvent(this));
				
		}, this);
		
		
		var tfoot = table.getElement("tfoot");
		if(tfoot){
			var totals = tfoot.getElements("td.total,th.total");
			if(totals){
				this.totals = new Array();
				this.footers = totals[0].getParent("tr").getElements("td,th");
				totals.each(function(cell){
					var field = cell.get("class").replace(" total", "");
					this.totals[field] = cell;					
				}, this);
			}
		}
		
		var noData = table.getElement("input[name=noDataMessage]");
		if(noData && !options.noDataMessage) this.options.noDataMessage = noDataInput.get("value");
		
		this.editableCells = new Array();
		this.editableCellsPerRow = 0;
		
		this.tbody = this.requireElement("tbody", table, "Element <tbody> is required inside <table>.");
		
		this.rows = this.tbody.getChildren("tr");
		if(!this.rows) this.throwError("Element <tbody> requires at least one row.");
		
		this.rows.each(function(row, rowIndex){
		
			this.addStripe(row, rowIndex);
			var cells = row.getChildren("td");
			
			var keyInput = row.getElement("input[name^=edit]");
			if(keyInput && this.options.hideInputs){
				var parentCell = keyInput.getParent("td");
				if(parentCell){
					var editColumn = cells.indexOf(parentCell);
					if(this.headers) this.headers[editColumn].setStyle("display", "none");
					if(this.footers) this.footers[editColumn].setStyle("display", "none");
					parentCell.setStyle("display", "none");
				}
				else keyInput.setStyle("display", "none");
			}
			
			cells.each(function(cell, colIndex){
				
				var cellID = rowIndex + ":" + colIndex;
				
				var column = this.headers[colIndex];
				var colType = column.retrieve("colType");
				
				var loadingIcon = cell.getElement(".loading");
				if(loadingIcon) loadingIcon.setStyle("display", "none");
				
				if(column.hasClass("sortable")){
			
					if(colType == "numeric" && !column.hasClass("numeric")){
						var text = cell.get("text");
						if(text && !text.match(/[-+]?\d*\.?\d+/)) column.store("colType", "string");
					}		
				}
				
				if(cell.hasClass("editable")){
				
				
					this.editableCells.push(cell);
					if(rowIndex == 0) this.editableCellsPerRow++;
				
					if (!form) this.throwError("Cells require a <form> element to be editable.");
					
					var span  = this.requireElement("span", cell, "A <span> element is required in editable cell " + cellID + ".");
					var input = this.requireElement("input,select,textarea", cell, "An <input>, <select>, or <textarea> element is required in editable cell " + cellID + ".");
				  	
				  	var field = this.getInputField(input);
				  	if(!field) this.throwError("Input element's \"name\" attribute must be in the format [field][number].");
				  	span.setStyle("display", "inline");
					input.setStyle("display", "none");
				  	input.set("autoComplete", "off");
				  	var tag = input.get("tag");
					input.store("currentValue", input.get("value"));
					input.store("column", colIndex);
				  	
				  	/* IE Selects fire on every key press, so make them act like Firefox */
				  	var tridentSelect = (Browser.Engine.trident && tag == "select") ? true : false;
				  	input.store("tridentSelect", tridentSelect);
				
					if(this.options.hideInputs){
						cell.addEvent("click", function(event){
											
							span.setStyle("display", "none");
							input.setStyle("display", "inline");
						
							input.focus();
							if(input.select && this.options.autoSelect) input.select();
											
						}.bindWithEvent(this));
					}
					

					input.addEvent("blur", function(event){
						
						if(tridentSelect) this.addEditJob(input, span, loadingIcon, colIndex);
						if(!this.options.hideInputs) return;
						span.setStyle("display", "inline");
						input.setStyle("display", "none");
											
					}.bindWithEvent(this));
					
					input.addEvent("change", function(event){
					
						if(tridentSelect) return;
						this.addEditJob(input, span, loadingIcon, colIndex);
					
					}.bindWithEvent(this));
					
					input.addEvent("click", function(event){
						
						event.stopPropagation();
						
					}.bindWithEvent(this));
						   
					
					input.addEvent("esckey", function(event){
						this.setValue(input, input.retrieve("currentValue"));
						if(input.select && this.options.autoSelect) input.select();
						else input.focus();
					}.bindWithEvent(this));
						
					   
					if(this.options.shortcutKeys){
					
						input.addEvent("tabkey", function(event){
							event.preventDefault();
							var step = (event.shift) ? -1 : 1;
							this.walkCells(cell, step);
						}.bindWithEvent(this));
						
						input.addEvent("enterkey", function(event){
							if(!event.shift && tag == "textarea") return;
							event.preventDefault();
							var perRow = this.editableCellsPerRow;
							var step = (event.shift) ? -perRow : perRow;
							this.walkCells(cell, step);
						}.bindWithEvent(this));
						
						if(tag != "select"){
							input.addEvent("arrowkeys", function(event){
								event.preventDefault();
								var perRow = this.editableCellsPerRow;
								switch(event.key){
									case "up": var step = -perRow; break;
									case "down": var step = perRow; break;
								}
								this.walkCells(cell, step);
							}.bindWithEvent(this));
						}
					}
					  
				} else if(cell.getElement("input[name^=delete]")){
					
					var input = this.requireElement("input[type=checkbox]", cell, "An <input> checkbox element is required for deletable rows in cell " + cellID + '.\n(Name property should be "delete[]".)');
					if(this.options.hideInputs) input.setStyle("display", "none");
					
					cell.addEvent("click", function(event){
						
						event.preventDefault();
						
						var key = input.get("value");
						
						var job = {
							row: row,
							data: {
								'delete[]': key
							}
						}
					
						var answer = (this.options.deletePrompt) ? confirm(this.options.deletePrompt) : true;
						if(answer){
							if(loadingIcon){
								loadingIcon.setStyle("display", "inline");
								job.loading = loadingIcon;
							}
							this.addToQueue(job);
						}
						
					}.bindWithEvent(this));
				
				}
					
			}, this);
						
		}, this);
		
		if(this.options.taskMaster > 1000) this.taskMaster.periodical(this.options.taskMaster, this);
	},
	
	queue: new Array(),
	
	requireElement: function(css, parent, error, exclude){
	
		//var elements = parent.getChildren(css);
		
		/* This is a workaround for lack of "," support in getChildren... change to getChildren when fixed */
		var split = css.split(",");
		var elements = [];
		for(i=0;i<split.length;i++){
			elements.combine(parent.getChildren(split[i]));
		}
		/* End workaround */
		
		if(!elements) this.throwError(error);
		var match;
		elements.each(function(element){
			if(element.hasClass(exclude)) return;
			else match = element; 
		});
		return match;
	},
	
	throwError: function(error){
	
		var exception = "TableGear Error: " + error;
		alert(exception);
		throw new Error(exception);
	},
	
	addEditJob: function(input, span, loading, colIndex){
	
		if(colIndex == this.currentIndex){
			this.headers[this.currentIndex].carat.empty();
			this.currentIndex = null;
		}
			
		var newValue = input.get("value");
		var currentValue = input.retrieve("currentValue");
		
		if(newValue == currentValue) return;
		else input.store("currentValue", input.get("value"));
		
		var name = this.getInputField(input);
		
		var job = {
			input: input,
			span: span,
			data: {
				"fields[]": name.field,
				"edit[]": name.key,
				"column": input.retrieve("column")
			}
		}
		job.data[name.full] = newValue;
		
		if(loading){
			loading.setStyle("display", "inline");
			job.loading = loading;
		}
		
		this.addToQueue(job);
	},
	
	getInputField: function(input){
	
		var name  = input.get("name");
		var match = name.match(/^(.+?)(\d+)$/);
		if(!match || !match[1] || !match[2]) return false;
		return {
			full: name,
			field: match[1],
			key: match[2]
		}
	},
	
	addToQueue: function(job){
		
		this.queue.push(job);
		if(!this.request || !this.request.running) this.nextRequest();
	},
	
	nextRequest: function(){
	
		if(this.queue.length <= 0) return;
		this.currentJob = this.queue.shift();
		
		this.request = new Request({
			url: this.url,
			onComplete: this.onComplete.bind(this),
			data: this.currentJob.data
		});
		this.request.send();
	},
	
	onComplete: function(response){
		
		if(this.currentJob.loading) this.currentJob.loading.setStyle("display", "none");
		
		var json = JSON.decode(response);
				
		if(json.affected > 0){
		
			if(json.action == "edit" &&  this.currentJob.input.get("name") == json.name){
				this.currentJob.span.set("html", json.formatted);
				this.setValue(this.currentJob.input, json.value);
			} else if(json.action == "delete" && this.currentJob.data["delete[]"] == json.key){
		
				this.rows.erase(this.currentJob.row);
				this.currentJob.row.destroy();
				
				if(this.rows.length < 1){
					var colspan = this.headers.length;
					this.headers.each(function(header){
						if(header.getStyle("display") == "none") colspan--;
					});
					var noData = new Element("td", {"text": this.options.noDataMessage,"colspan": colspan,"align": "center"});
					var noRow = new Element("tr", {"class": "odd"});
					this.tbody.adopt(noRow.adopt(noData));
				} else {
					this.sortRows();
				}
			}
			if(json.totals) this.updateTotals(json.totals);
			
		} else if(json.value){
			this.setValue(this.currentJob.input, json.value);
		}
		this.currentJob = null;
		this.nextRequest();
	},
	
	sortRows: function(){
		
		this.rows = this.rows.sort(this.sortData.bind(this));
		if(this.currentDesc) this.rows = this.rows.reverse();		
				
		this.editableCells.empty();
		
		this.rows.each(function(row, index){
		
			this.addStripe(row, index);
			var cells = row.getChildren("td.editable");
			cells.each(function(cell){
				this.editableCells.push(cell);
			}, this);
		}, this);
		
		this.tbody.adopt(this.rows);
		var carat = (this.currentDesc) ? this.options.descCarat : this.options.ascCarat;
		
		this.headers.each(function(header){
			
			if(header.carat){
				if(header == this.headers[this.currentIndex]) header.carat.set("html", carat);
				else header.carat.empty();
			}
		}, this);
		
	},
	
	update: function(){
	
		this.rows = this.tbody.getChildren("tr");
		this.sortRows();
	},
	
	addStripe: function(row, index){
	
		if(!this.options.rowStriping) return;
		var css = ((index + 1) % 2) ? "odd" : "even";
		row.erase("class");
		row.addClass(css);
	},
	
	sortData: function(row1, row2){
		
		var data1 = this.getData(row1, this.currentIndex);
		var data2 = this.getData(row2, this.currentIndex);
		
		if(this.currentType == "numeric"){
		
			data1 = data1.replace(/[,:]/g, "");
			data2 = data2.replace(/[,:]/g, "");
			data1 = data1.match(/[-+]?\d*\.?\d+/)[0];
			data2 = data2.match(/[-+]?\d*\.?\d+/)[0];
			if(data1) data1 = data1.toFloat();
			else data1 = -Infinity;
			if(data2) data2 = data2.toFloat();
			else data2 = -Infinity;
					
		} else if(this.currentType == "date" || this.currentType == "eDate"){
		
			var eur = (this.currentType == "eDate") ? true : false;
			data1 = this.getDate(data1, eur);
			data2 = this.getDate(data2, eur);
			
		} else if(this.currentType == "memory"){
			
			data1 = this.getMemory(data1);
			data2 = this.getMemory(data2);
		
		} else if (this.currentType == "string"){
			data1 = data1.toLowerCase();
			data2 = data2.toLowerCase();
		}
		
		if(data1 == data2) return 0;
		return (data1 < data2) ? -1 : 1;
	},
	
	getData: function(row, index){
	
		if(index == null) return;
		var cell = row.getChildren("td")[index];
		var span = cell.getElement("span");
		var text = (span) ? span.get("text") : cell.get("text");
		return text.trim();
	},
	
	getDate: function(s, eur){
	
		if(eur){
			s = s.replace(/(\d+)\/(\d+)\/(\d+)/g, "$2/$1/$3");
		}
		var date = new Date(s);
		if(!date.getYear()){
		
			/* Get dates formatted 10*23*2003 (or some other strange delimiter) */
			var match = s.match(/^(\d{1,2})\D(\d{1,2})\D(\d{2,4})$/);	
			if(match) date = new Date(match[1] + "/" + match[2] + "/" + match[3]);
			else {
				/* Get foreign dates: 2003年10月23日 */
				match = s.match(/^(\d{4})\D(\d{1,2})\D(\d{1,2})\D$/g);
				if(match) date = new Date(match[1] + "/" + match[2] + "/" + match[3]);
			}
		}
		
		return date.getYear() ? date : s;
	},
	
	getMemory: function(s){
	
		var match = s.match(/^([0-9.]+)\s*([a-z]+)$/i);
		if(!match) return null;
		var data = match[1].replace(/,/g, "").toFloat();
		var unit = match[2].toLowerCase();
		if(!unit) unit = "b";
		var units = ["b", "kb", "mb", "gb", "tb"];
		data = data * Math.pow(1000, units.indexOf(unit));
		return data;
	},
	
	setValue: function(input, value){
		var tag = input.get("tag");
		if(tag == "select") input.selectedIndex = input.getElement("option[value="+value+"]").index;
		else input.set("value", value);
	},
	
	walkCells: function(current, step){
	
		var index = this.editableCells.indexOf(current);
		var target = this.editableCells[index + step];
		if(target) target.fireEvent("click");
	},
	
	updateTotals: function(totals){
	
		totals.each(function(obj){
		
			var field = obj.field;
			var total = obj.total;
			var cell  = this.totals[field];
			if(cell) cell.set("text", total);
		}, this);
	},
	
	taskMaster: function(){
	
		if(!this.currentJob) return;
		if(!this.lastJob || this.lastJob != this.currentJob){
			this.lastJob = this.currentJob;
			return;
		}
		this.request.cancel();
		this.request.send(); // Get back to work!
	}
});


if(!Element.Events.tabkey){
	Element.Events.tabkey = {
		base: "keydown",
		condition: function(event){
			return (event.key == "tab");
		}
	}
}
if(!Element.Events.enterkey){
	Element.Events.enterkey = {
		base: "keydown",
		condition: function(event){
			return (event.key == "enter");
		}
	}
}

if(!Element.Events.esckey){
	Element.Events.esckey = {
		base: "keydown",
		condition: function(event){
			return (event.key == "esc");
		}
	}
}

if(!Element.Events.arrowkeys){
	Element.Events.arrowkeys = {
		base: "keydown",
		condition: function(event){
			var arrows = ["up", "down"];
			return (arrows.contains(event.key));
		}
	}
}

