<?php

//------------------------------------
// process.php
// processes calls to Kairos API (for examples and webcam modules)
// created: June 2016
// author: Steve Rucker
//------------------------------------

$configs = include('../config.php');

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

echo $response;
// // close the session
curl_close($request);



?> 