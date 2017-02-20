<?php

//------------------------------------
// get-file-data.php
// retrieves file data, size, and mime type
// for video and image analysis
// created: August 2016
// author: Steve Rucker
//------------------------------------

function file_mime_type($file) {
    $mime = false;

    $file_info = new finfo(FILEINFO_MIME);
    $mime = $file_info->buffer(file_get_contents($file));

    return substr($mime, 0, strpos($mime, '; '));
}

if ($_POST['fname'] == "url") {

	// get URL from AJAX POST
    $thisUrl = $_POST["url"];

	// check for file_get_contents error
	if( ($data = @file_get_contents($thisUrl)) === false){
	  	$fileType = NULL;
	  	$fileSize = NULL;
		$fileData = NULL;
	}
	else {
		$file = file_get_contents($thisUrl);
		$fileType = file_mime_type($thisUrl);
		$fileSize = strlen($file);
		$fileData = base64_encode($file);
	}
	$response = array (
		"fileType" => $fileType,
		"fileSize" => $fileSize,
		"fileData" => $fileData
	);
} else if ($_POST['fname'] == "upload") {
	$file = $_FILES["file"]["tmp_name"];
	$response = array (
		"fileType" => file_mime_type($file)
	);
}


print_r(json_encode($response));

?>