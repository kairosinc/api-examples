<?php

$API_URL = "https://api.kairos.com";
$APP_ID = "your_app_id";
$APP_KEY = "your_app_key";

// enter your media ID here:
$mediaId = "";

$request = curl_init();
// set curl options
curl_setopt($request, CURLOPT_URL, $API_URL . "/v2/media/" . $mediaId);
curl_setopt($request, CURLOPT_HTTPHEADER, array(
        "app_id:" . $APP_ID,
        "app_key:" . $APP_KEY
    )
);
curl_setopt($request, CURLOPT_RETURNTRANSFER, true);

$response = curl_exec($request);

echo $response;
// // close the session
curl_close($request);

?>