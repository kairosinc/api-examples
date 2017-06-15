<?php

$api_url = "api.kairos.com";
// Enter your app id and key:
$app_id = "";
$app_key = "";

$queryUrl = $api_url . "/detect";

$request = curl_init($queryUrl);
// set curl options
curl_setopt($request, CURLOPT_POST, true);
curl_setopt($request,CURLOPT_POSTFIELDS, $_POST["imgObj"]);
curl_setopt($request, CURLOPT_HTTPHEADER, array(
        "Content-type: application/json",
        "app_id:" . $app_id,
        "app_key:" . $app_key
    )
);

curl_setopt($request, CURLOPT_RETURNTRANSFER, true);

$response = curl_exec($request);

echo $response;
// // close the session
curl_close($request);

?> 