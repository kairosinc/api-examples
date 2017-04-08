<?php
//------------------------------------
// form-post.php
// processes form posts to Kairos API (for upload module)
// created: March 2016
// last modified: August 2016
// author: Steve Rucker
//------------------------------------

// include "config.php" file for api_url, app_id, and app_key
$configs = include('../config.php');

// make curl request
$request = curl_init(API_URL . "/v2/media?landmarks=1");

// set curl options
curl_setopt($request, CURLOPT_POST, true);
curl_setopt($request, CURLOPT_HTTPHEADER, array(
    "app_id:" . APP_ID, 
    "app_key:" . APP_KEY
    )
);
curl_setopt(
    $request,
    CURLOPT_POSTFIELDS,
    array(
      "source" => new CurlFile($_FILES["file"]["tmp_name"]),
      // API timeout - timeout can be set to config value:
      // "timeout" => $configs["apiTimeout"]
      // or, to use polling, set timout to 1:
      "timeout" => 1
    ));
// output the response
curl_setopt($request, CURLOPT_RETURNTRANSFER, true);

$response =  curl_exec($request);

echo $response;

curl_close($request);

// to store uploaded files locally, first create upload directory
//$target = "uploads/";
//move_uploaded_file($_FILES['upload']['tmp_name'], $target.$_FILES['upload']['name']);
?>

