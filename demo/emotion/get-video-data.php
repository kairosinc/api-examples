<?php

// get URL from AJAX POST
$thisUrl = $_POST["url"];
$videoExt = $_POST["videoExt"];
$html5Video = "false";
if ($videoExt == "webm" || $videoExt == "mp4") {
	$html5Video = "true";
}

// check for file_get_contents error
if( ($data = @file_get_contents($thisUrl)) === false || $html5Video == "false"){
	$videoData = NULL;
}
else {
	$video = file_get_contents($thisUrl);
	$mimeType = "video/webm";
	if ($videoExt == "mp4") {
		$mimeType = "video/mp4";
	}
	$videoData = "data:" . $mimeType . ";base64," . base64_encode($video);
}
$response = array (
	"imageData" => $videoData
);

print_r(json_encode($response));

?>