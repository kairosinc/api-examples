//------------------------------------
// emotionUi.js
// a collection of javascript functions to enable user interactions
// dependencies: jquery.js, clipboard.js, highchartsApp.js
// created: April 2016
// last modified August 2016
// author: Steve Rucker
//------------------------------------

$(".video-thumbnail img").eq(0).css("opacity","1");

// show/hide Highcharts tooltip
$("#highcharts-containers").mouseover(function () {
	$(".highcharts-tooltip").show();
});
$("#highcharts-containers").mouseout(function () {
	$(".highcharts-tooltip").hide();
});

// provide functionality for Copy to Clipboard button
var clipboard = new Clipboard('.copy-json-button');

$(".media-thumbnail").click(function(e) {
	e.preventDefault();
	if (emoDemoApp.apiCredentials && !emoDemoApp.processing) {
		$(".video-wrapper").show();
		$("#video").attr("src","");
		$(".show-image").attr("src","");
		$("#highcharts-titles, #highcharts-containers, .video-controls").hide();
		$(".media-thumbnail img").css("opacity","0.7");
		$(this).find("img").css("opacity","1");
		var mediaType = "video";
		if ($(this).hasClass("image-thumbnail")) {
			mediaType = "image";
			$(".show-image")
				.attr("mediaId",$(this).attr("href"))
				.show();
		}
		else {
			$("#video")
				.attr("mediaId",$(this).attr("href"))
				.show();
			$(".video-controls").show();
		}
		emoDemoApp.resetElements();
		emoDemoApp.examplesModule(mediaType);
	}
});

// show/hide JSON
$(".show-json").click(function (e) {
	e.preventDefault();
	$(".highcharts-container").hide();
	$(".json-response-container").show();
	$(".copy-json-button").show();
});
$(".hide-json").click(function (e) {
	e.preventDefault();
	$(".highcharts-container").show();
	$(".json-response-container").hide();
	$(".copy-json-button").hide();
});
// toggle autoscale in Highcharts, depending on Autoscale checkbox
$("#autoscale").change(function () {
	if ($(this).prop("checked")) {
		highchartsApp.autoscale = true;
	}
	else {
		highchartsApp.autoscale = false;
	}
	$("#highcharts-containers").empty();
	highchartsApp.trackVideo = false;
	highchartsApp.displayData();
});
// toggle autoscale in Highcharts, depending on Autoscale checkbox
$("#featurepoints").change(function () {
	if ($(this).prop("checked")) {
		$("#displayCanvas").show();
	}
	else {
		$("#displayCanvas").hide();
	}
});
$(".webcam-button").click(function(e){
	e.preventDefault();
	if (!emoDemoApp.processing) {
		// emoDemoApp.resetElements();
		$(".video-wrapper").hide();
		$(".webcam-video-container").show();
		$(".face-overlay").hide();
		$(".webcam-counter").html("");
		$(".video-thumbnail img").css("opacity","0.7");
		emoDemoApp.getTemplate("video-container-template","","Waiting for webcam...",true);
		$("#highcharts-titles, #highcharts-containers").hide();
		// create new video element
		$( "#webcamVideo" ).remove();
		$( ".webcam-video-container" ).append( $( '<video id="webcamVideo"></video>' ) );
		$("#webcamVideo").show();
		emoDemoApp.webcamModule();
	};
});
// disable upload button if processing is 
// taking place from another module
$("#upload").click(function(e) {
	if(emoDemoApp.processing) {
		e.preventDefault();
	}
});
// submit form automatically
// when file is selected
$("#upload").change(function(){
    $('#mediaUploadForm').submit();
});
$(".url-from-web").click(function(){
	$(this).val("");
});
$(document).keydown(function(){
	if(window.event.keyCode=="13"){
        $(".submit-button").click();
    }
});


 
