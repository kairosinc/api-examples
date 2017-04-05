<?php

//------------------------------------
// process.php
// processes calls to Kairos API (for facerace demo)
// created: March 2017
// author: Josue Rodriguez
//------------------------------------

$configs = include('../config.php');

require_once('./diversity_recognition.php');

$queryUrl = API_URL . "/detect";

$request = curl_init($queryUrl);
// set curl options
curl_setopt($request, CURLOPT_POST, true);
curl_setopt($request,CURLOPT_POSTFIELDS, $_POST["imgObj"]);
curl_setopt($request, CURLOPT_HTTPHEADER, array(
        "Content-type: application/json",
        "app_id:" . APP_ID,
        "app_key:" . APP_KEY
    )
);

curl_setopt($request, CURLOPT_RETURNTRANSFER, true);

$response = curl_exec($request);

try {
	$json_data = json_decode($response, true);
	$get_request = json_decode($_POST["imgObj"], true);
	$image_data = $get_request['image'];

	if (!empty($json_data['images'][0]['faces'][0]['attributes']['age'])) {
		$Diversity = new DiversityRecognition();
		$processed = $Diversity->processEverything($json_data, $image_data, true);

		if (!empty($processed['s3_image_url'])) {
			$json_data['s3_image_url'] = $processed['s3_image_url'];

			$response = json_encode($json_data);
		}

		$Diversity->recursiveRemoveDirectory($processed['face_dir']);
	}
} catch (Exception $e) {
	//print 'Error: '.$e->getMessage();
}

echo $response;

// // close the session
curl_close($request);



?> 