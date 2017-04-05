<?php

//------------------------------------
// get-exif-data.php
// retrieves exif data from image url
// created: March 2017
// author: Steve Rucker
//------------------------------------

// get URL from AJAX POST
$thisUrl = $_POST["url"];
$exifData = exif_read_data($thisUrl);

print_r($exifData["Orientation"]);

?>