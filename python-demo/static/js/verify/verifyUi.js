//------------------------------------
// verifyUi.js
// a collection of javascript functions to enable user interactions
// dependencies: jquery.js, clipboard.js
// created: July 2017
// author: Steve Rucker
//------------------------------------

// show/hide UI toolbar containing webcam, upload and URL
if (utils.getUrlVars()["ui"] && utils.getUrlVars()["ui"] == "no") {
	$(".ui-buttons").hide();
}
else {
	$(".ui-buttons").show();
}

// provide functionality for Copy to Clipboard button
var clipboard = new Clipboard('.copy-json-button');
$(".image-group").eq(0).addClass("active");

$(".image-group").click(function(e) {
	e.preventDefault();
	if (!verifyDemoApp.processingLeft && !verifyDemoApp.processingRight) {
		$(".url-from-web").val("URL from the web");
		$(".image-group").removeClass("active");
		$(".hover-message").html($(this).attr("hoverMessage"))
		$(this).addClass("active");
		if (verifyDemoApp.apiCredentials) {
			$("#image-left")
				.attr("src",$(this).children().eq(0).find("img").attr("src"))
				.attr("galleryId",$(this).children().eq(0).find("img").attr("galleryId"))
				.attr("subjectId",$(this).children().eq(0).find("img").attr("subjectId"))
				.attr("style","")
				.show();
			$("#image-right")
				.attr("src",$(this).children().eq(1).find("img").attr("src"))
				.attr("galleryId",$(this).children().eq(1).find("img").attr("galleryId"))
				.attr("subjectId",$(this).children().eq(1).find("img").attr("subjectId"))
				.attr("style","")
				.show();
			verifyDemoApp.setElementDimensions();
			verifyDemoApp.examplesModule();
		}
	}
});
$( ".image-group" ).hover(
  function() {
    $(this).find("img").css("opacity","1");
  }, function() {
    $(this).find("img").css("opacity","0.5");
  }
);
// show/hide JSON
$(".show-json").click(function (e) {
	e.preventDefault();
	$(".right-image-container").hide();
	$(".json-response-container").show();
	$(".copy-json-button").show();
});
$(".hide-json").click(function (e) {
	e.preventDefault();
	$(".right-image-container").show();
	$(".json-response-container").hide();
	$(".copy-json-button").hide();
});
// submit form automatically
// when file is selected
$("#upload-left").change(function(){
    $('#mediaUploadForm-left').submit();
});
$("#upload-right").change(function(){
    $('#mediaUploadForm-right').submit();
});
$(".url-from-web").click(function(){
	$(this).val("");
});
$(document).keydown(function(){
	if(window.event.keyCode=="13"){
		verifyDemoApp.keydown = true;
        $(".submit-button").click();
    }
});
// hover element showing example names
$( ".image-group" ).hover(
	function(){
    	$(this).find(".hover-title").fadeIn("slow");
	},
	function(){
    	$(this).find(".hover-title").fadeOut();
	}
);
var changeButtonContent = function () {
	if ($(window).width() < 480) {
		$(".url-from-web").attr("value","Web URL");
	}
	else {
		$(".url-from-web").attr("value","URL from the web");
	}
};
changeButtonContent();
$( window ).resize(function() {
  	verifyDemoApp.setElementDimensions();
  	changeButtonContent();
});
	







 
