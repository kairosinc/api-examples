<?php

//------------------------------------
// verify.php
// processes calls to Kairos API for verify demo
// created: June 2016
// author: Steve Rucker
//------------------------------------

$configs = include('../config.php');

if ($_POST['process'] == "enroll") {

	$request = curl_init(API_URL . "/enroll");

	curl_setopt($request, CURLOPT_POST, true);
	curl_setopt($request, CURLOPT_HTTPHEADER, array(
		"Content-type: application/json",
	    "app_id:" . APP_ID, 
	    "app_key:" . APP_KEY
	    )
	);
	curl_setopt($request,CURLOPT_POSTFIELDS, $_POST["imgObj"]);
	// output the response
	curl_setopt($request, CURLOPT_RETURNTRANSFER, true);

	$response = curl_exec($request);

	echo $response;
	// // close the session
	curl_close($request);

}

if ($_POST['process'] == "verify") {

	$request = curl_init(API_URL . "/verify");

	curl_setopt($request, CURLOPT_POST, true);
	curl_setopt($request, CURLOPT_HTTPHEADER, array(
		"Content-type: application/json",
	    "app_id:" . APP_ID, 
	    "app_key:" . APP_KEY
	    )
	);
	curl_setopt($request,CURLOPT_POSTFIELDS, $_POST["imgObj"]);
	// output the response
	curl_setopt($request, CURLOPT_RETURNTRANSFER, true);

	$response = curl_exec($request);

	echo $response;
	// // close the session
	curl_close($request);

}

?> 