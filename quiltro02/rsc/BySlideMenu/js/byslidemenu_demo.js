var verticaltextmenu;
window.addEvent('load', function(){
	var slideMenu = new BySlideMenu();
	var compressmenu = new BySlideMenu('compressmenu', {
		compressSize: 10,
		duration: 250
	});
	var verticalmenu = new BySlideMenu('verticalmenu', {vertical: true});
	var indexmenu = new BySlideMenu('indexmenu', {
		defaultIndex: 4,
		transition: Fx.Transitions.Bounce.easeOut
	});
	var expandclickmenu = new BySlideMenu('expandclickmenu', {expandMode: 'click'});
	var pinclickmenu = new BySlideMenu('pinclickmenu', {pinMode: 'click'});
	var pinovermenu = new BySlideMenu('pinovermenu', {pinMode: 'mouseover'});
	var clickmenu = new BySlideMenu('clickmenu', {expandMode: 'click', pinMode: 'click'});
	var textmenu = new BySlideMenu('textmenu', {
		defaultIndex: 1,
		elementHeight: 30,
		elementWidth: 185
	});
	verticaltextmenu = new BySlideMenu('verticaltextmenu', {
		defaultIndex: 1,
		vertical: true,
		elementHeight: 130,
		elementWidth: 200,
		compressSize: 30,
		useOverflow: true
	});
	var fullwidthmenu = new BySlideMenu('fullwidthmenu', {
		defaultIndex: 1,
		containerHeight: 30,
		containerWidth: "full"
	});
});