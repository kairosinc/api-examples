//------------------------------------
// detectUi.js
// a collection of javascript functions to enable user interactions
// dependencies: jquery.js, clipboard.js
// created: May 2016
// author: Steve Rucker
//------------------------------------

// provide functionality for Copy to Clipboard button
var clipboard = new Clipboard('.copy-json-button');
$(".photo-thumbnail img").eq(0).css("opacity","1");

$(".photo-thumbnail").click(function(e) {
	e.preventDefault();
	if (!detectDemoApp.processingExample) {
		$(".photo-thumbnail img").css("opacity","0.7");
		$(this).find("img").css("opacity","1");
		if (detectDemoApp.apiCredentials) {
			// show selected preview image
			$("#previewImage")
				.attr("src",$(this).find("img").attr("src"))
				.show();
			detectDemoApp.resetElements();
			detectDemoApp.examplesModule();
		}
	}
});
$(".webcam-button").click(function(e){
	e.preventDefault();
	// create new video element
	$( "#webcamVideo" ).remove();
	$( ".webcam-video-container" ).append( $( '<video id="webcamVideo"></video>' ) );
	$("#webcamVideo").show();
	detectDemoApp.resetElements();
	detectDemoApp.getTemplate("image-container-template","","Waiting for webcam...",true);
    // start webcam module
	detectDemoApp.webcamModule();
});
$("#upload").change(function(){
    detectDemoApp.resetElements();
    detectDemoApp.getTemplate("image-container-template","","Analyzing image...",true);
    detectDemoApp.getTemplate("json-response-template","","Generating results...",true);
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



 
