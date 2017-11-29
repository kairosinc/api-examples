//------------------------------------
// detectUi.js
// a collection of javascript functions to enable user interactions
// dependencies: jquery.js, clipboard.js
// created: May 2016
// modified: March 2017
// author: Steve Rucker
//------------------------------------

// show/hide UI toolbar containing webcam, upload and URL
if (utils.getUrlVars()["ui"] && utils.getUrlVars()["ui"] == "no") {
	$(".ui-buttons").hide();
}
else {
	$(".ui-buttons").show();
}
// show/hide options panel
if (utils.getUrlVars()["option-panel"] && utils.getUrlVars()["option-panel"] == "yes") {
	$(".options-panel").show();
}
else {
	$(".options-panel").hide();
}

// show JSON container by default at larger resolutions
if ($(window).width() > 768) {
	$(".json-response-container").show();
}
// provide functionality for Copy to Clipboard button
var clipboard = new Clipboard('.copy-json-button');
$(".photo-thumbnail img").eq(0).css("opacity","1");

$(".photo-thumbnail").click(function(e) {
	e.preventDefault();
	if (detectDemoApp.apiCredentials && !detectDemoApp.processing) {
		$(".photo-thumbnail img").css("opacity","0.7");
		$(this).find("img").css("opacity","1");
		// show selected preview image
		$("#previewImage")
			.attr("src",$(this).find("img").attr("src"))
			.show();
		detectDemoApp.resetElements();
		detectDemoApp.examplesModule($(this).find("img")[0]);
	}
});
$(".webcam-button").click(function(e){
	e.preventDefault();
	if (!detectDemoApp.processing) {
		// create new video element
		$( "#webcamVideo" ).remove();
		$( ".webcam-video-container" ).append( $( '<video id="webcamVideo"></video>' ) );
		$("#webcamVideo").show();
		detectDemoApp.resetElements();
		detectDemoApp.errorTemplate("image-container-template","","Waiting for webcam...",true);
	    // start webcam module
		detectDemoApp.webcamModule();
	}
});
// disable upload button if processing is 
// taking place from another module
$("#upload").click(function(e) {
	if(detectDemoApp.processing) {
		e.preventDefault();
	}
});
$("#upload").change(function(){
    detectDemoApp.resetElements();
    detectDemoApp.errorTemplate("image-container-template","","Analyzing image...",true);
    detectDemoApp.errorTemplate("json-response-template","","Generating results...",true);
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
// show/hide JSON
$('.show-hide-json').click(function(e) {
	e.preventDefault();
    var s = $(this);
    $('.json-response').slideToggle('fast', function(){
    	if ($(window).width() <= 767) {
	    	$(".copy-json-button").toggle();

	    }
        s.html(s.text() == 'HIDE JSON' ? 'SHOW JSON' : 'HIDE JSON');
    });
    return false;
});
// show/hide JSON (with Ethnicity)
// $('.show-hide-json').click(function(e) {
// 	e.preventDefault();
//     var s = $(this);
//     $('.json-response').slideToggle('fast', function(){
//     	if ($(window).width() <= 767) {
// 	    	$(".copy-json-button").toggle();
// 	    	// $(".show-hide-ethnicity").show();
// 	    }
// 	    if(s.html() == "SHOW JSON/ETHNICITY") {
// 			$(".show-hide-ethnicity").show();
// 			s.html("HIDE JSON/ETHNICITY");
// 		}
// 		else {
// 			$(".show-hide-ethnicity").hide();
// 			$(".ethnicity-graph").hide();
// 			$('.show-hide-ethnicity').html("ETHNICITY");
// 			s.html("SHOW JSON/ETHNICITY");
// 		}
//     });
//     return false;
// });
// show/hide JSON/ETHNICITY
$('.show-hide-ethnicity').click(function(e) {
	e.preventDefault();
	var s = $(this);
	if(s.html() == "SHOW JSON") {
		$(".ethnicity-graph").hide();
		s.html("ETHNICITY");
	}
	else {
		$(".ethnicity-graph").show();
		s.html("SHOW JSON");
	}
    return false;
});
$( window ).resize(function() {
  detectDemoApp.setElementDimensions();
});

// slider - confidence threshold
$(".confidencethreshold-slider").slider({
	range: "min",
	value: 98,
    min: 10,
    max: 100,
    slide: function( event, ui ) {
        $("#optionConfidenceThreshold").val(ui.value / 100);
    }
});
$("#optionConfidenceThreshold").click(function(){
	$(this).val("");
});
$("#optionConfidenceThreshold").keypress(function(event){
	if (utils.isNumber(event)) {
		setTimeout(function(){
			var thisVal = $("#optionConfidenceThreshold").val();
			var newVal = "";
			if (thisVal < .1 || thisVal > 1) {
				$(".option-error-confidence").html("Out of range");
				$("#optionConfidenceThreshold").val("");
				$(".confidencethreshold-slider").slider("value", .98);
			}
			else {
				$(".option-error-confidence").html("");
				$(".confidencethreshold-slider").slider("value", thisVal);
			}
			
		},1500)
	}
	else {
		return false;
	}
});
// slider  - minheadscale
$(".minheadscale-slider").slider({
	range: "min",
    min: 15,
    max: 500,
    slide: function( event, ui ) {
        $("#optionMinHeadScale").val(ui.value / 1000);
    }
});
$("#optionMinHeadScale").click(function(){
	$(this).val("");
});
$("#optionMinHeadScale").keypress(function(event){
	if (utils.isNumber(event)) {
		setTimeout(function(){
			var thisVal = $("#optionMinHeadScale").val();
			var newVal = "";
			if (thisVal < .015 || thisVal > .5) {
				$(".option-error-minheadscale").html("Out of range");
				$("#optionMinHeadScale").val("");
				$(".minheadscale-slider").slider("value", 15);
			}
			else {
				$(".option-error-minheadscale").html("");
				$(".minheadscale-slider").slider("value", thisVal * 1000);
			}
			
		},1500)
	}
	else {
		return false;
	}
});









 
