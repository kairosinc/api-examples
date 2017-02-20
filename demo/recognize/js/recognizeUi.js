//------------------------------------
// recognizeUi.js
// a collection of javascript functions to enable user interactions
// dependencies: jquery.js, clipboard.js
// created: December 2016
// author: Steve Rucker
//------------------------------------

// provide functionality for Copy to Clipboard button
var clipboard = new Clipboard('.copy-json-button');

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
$(".reset-panels").click(function (e) {
	e.preventDefault();
	$(".enrolled-images, .recognize-image-container").empty();
	$(".left-image-container .user-instructions").show();
	$(".right-image-container .user-instructions").hide();
	$(".image-right-template").hide();
	$(".right-image-example").hide();
	$(".show-json").hide();
	$(".main-container").removeClass("exercise-view")
	$(".ui-buttons .upload:first-child").show();
	$(".ui-buttons").show();
	$(".main-container").removeClass("enrolled");
	$(".main-container").removeClass("recognized");
	var canvas = $("#displayCanvas")[0];
    var context = canvas.getContext('2d');
    context.clearRect(0, 0, recognizeDemoApp.recognizeDisplaySize, recognizeDemoApp.recognizeDisplaySize);
    recognizeDemoApp.setElementDimensions();
    if ($(window).width() <= 479) {
    	$(".step-two-prompt").hide();
    	$(".ui-buttons .upload:first-child").show();
    	$(".ui-buttons .upload:nth-child(3)").hide();
    	if (!$(".main-container").hasClass("exercise-view")) {
            $(".right-image-container").hide();
        }
    }
    if ($(window).width() <= 600) {
    	$(".ui-buttons .upload:nth-child(3)").hide();
    	$(".example-instructions").hide();
    }
});
// submit form automatically
// when file is selected

$("#enrollImage").click(function(){
    $(this).val(null);
});
$("#enrollImage").change(function(){
    $(".enroll-form").submit();
});

$("#recognizeImage").click(function(){
	$(this).val(null);
});
$("#recognizeImage").change(function(){
    $(".recognize-form").submit();
});


$( window ).resize(function() {
  	recognizeDemoApp.setElementDimensions();
});

// drag/drop functionality
var handleDragOver = function(evt) {
    evt.stopPropagation();
    evt.preventDefault();
    evt.dataTransfer.dropEffect = "copy"; // Explicitly show this is a copy.
};
// Setup the dnd listeners.
var dropZone = $(".left-image-container")[0];
dropZone.addEventListener("dragover", handleDragOver, false);
dropZone.addEventListener("drop", recognizeDemoApp.enrollImage, false);

// Setup the dnd listeners.
var dropZone = $(".right-image-container")[0];
dropZone.addEventListener("dragover", handleDragOver, false);
dropZone.addEventListener("drop", recognizeDemoApp.recognizeImage, false);









 
