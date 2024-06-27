
	  //<!-- SmoothScroll-->
			  window.addEvent('domready',function() { 
				  new SmoothScroll({ duration:700 }, window); 
			  });
	  //<!-- /SmoothScroll-->
	  
	  //<!-- Strict Doctype Opening Links in a New Window-->
			  window.addEvent('domready', function() { 
				   $$('a.newWindow').addEvent('click', function(){ 
				   $$('a.newWindow').setProperties({ 
				   target: '_blank' }); }); });
	  //<!-- /Strict Doctype Opening Links in a New Window-->
	  
	  
	  //<!-- ROLLOVER -->	  
			window.addEvent('domready', function() {	  
			  doRollovers = function(elements) {
				elements.each(function(thisel){
				  var src = thisel.getProperty('src');
				  src = src.replace('_ro','');
				  var extension = src.substring(src.lastIndexOf('.'),src.length);
				  thisel.getParent().getParent().setStyle('background-color','url('+src.replace(extension,'_ro' + extension)+') no-repeat');
				  thisel.addEvent('mouseenter', function() { this.fade(0.40); });
				  thisel.addEvent('mouseleave', function() { this.fade(1);    });
				});
			  };
			  doRollovers($$('.rollover'));
			});	  
	  //<!-- /ROLLOVER -->	 
	  	  
//<!-- NEWS ROTATE -->	
		window.addEvent('domready',function(){
			var rotater = new Rotater('.slide_noticia',{ 		//Class of elements that should rotate.
				slideInterval:3000, 					//Length of showing each element, in milliseconds
				transitionDuration:1000 				//Length crossfading transition, in milliseconds
			});
		});	
var Rotater=new Class({Implements:[Options,Events],options:{slideInterval:4000,transitionDuration:1000,startIndex:0,autoplay:true},initialize:function(B,A){this.setOptions(A);this.slides=$$(B);this.createFx();this.showSlide(this.options.startIndex);if(this.slides.length<2){this.options.autoplay=false}if(this.options.autoplay){this.autoplay()}return this},toElement:function(){return this.container},createFx:function(){if(!this.slideFx){this.slideFx=new Fx.Elements(this.slides,{duration:this.options.transitionDuration})}this.slides.each(function(A){A.setStyle("opacity",0)})},showSlide:function(B){var A={};this.slides.each(function(C,D){if(D==B&&D!=this.currentSlide){A[D.toString()]={opacity:1}}else{A[D.toString()]={opacity:0}}},this);this.fireEvent("onShowSlide",B);this.currentSlide=B;this.slideFx.start(A);return this},autoplay:function(){this.slideshowInt=this.rotate.periodical(this.options.slideInterval,this);this.fireEvent("onAutoPlay");return this},stop:function(){$clear(this.slideshowInt);this.fireEvent("onStop");return this},rotate:function(){current=this.currentSlide;next=(current+1>=this.slides.length)?0:current+1;this.showSlide(next);this.fireEvent("onRotate",next);return this}});
//<!-- /NEWS ROTATE -->