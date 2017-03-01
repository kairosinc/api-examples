<?php

$API_URL = "https://api.kairos.com";
$APP_ID = "your_app_id";
$APP_KEY = "your_app_key";

// make curl request
$request = curl_init($API_URL . "/v2/media?landmarks=1");

// set curl options
curl_setopt($request, CURLOPT_POST, true);
curl_setopt($request, CURLOPT_HTTPHEADER, array(
    "app_id:" . $APP_ID, 
    "app_key:" . $APP_KEY
    )
);
curl_setopt(
    $request,
    CURLOPT_POSTFIELDS,
    array(
      "source" => new CurlFile($_FILES["file"]["tmp_name"]),
      "timeout" => 1
    ));

// output the response
curl_setopt($request, CURLOPT_RETURNTRANSFER, true);

$response =  curl_exec($request);

echo $response;

curl_close($request);


?>

