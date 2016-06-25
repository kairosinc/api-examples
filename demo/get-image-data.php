<?php

// get URL from AJAX POST
$thisUrl = $_POST["url"];
// check for file_get_contents error
if( ($data = @file_get_contents($thisUrl)) === false){
  	$imageType = NULL;
	$imageData = NULL;
}
else {
	$image = file_get_contents($thisUrl);
	$imageType = getimagesize($thisUrl);
	$imageData = "data:image/jpg;base64," . base64_encode($image);
}
$response = array (
	"imageType" => $imageType,
	"imageData" => $imageData
);

print_r(json_encode($response));

?>