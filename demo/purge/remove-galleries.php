<?php

//------------------------------------
// remove-galleries.php
// removes galleries from KairosId which are 
// older than specified time
// created: June 2016
// author: Steve Rucker
//------------------------------------

$configs = include('../config.php');

// get a list of all galleries
$request = curl_init(API_URL . "/gallery/list_all");

curl_setopt($request, CURLOPT_POST, true);
curl_setopt($request, CURLOPT_HTTPHEADER, array(
    "app_id:" . APP_ID, 
    "app_key:" . APP_KEY
    )
);
// output the response
curl_setopt($request, CURLOPT_RETURNTRANSFER, true);

$response = curl_exec($request);

removeGalleries($response);
// // close the session
curl_close($request);

// remove galleries method
function removeGalleries($response) {
    $galleries = json_decode($response)->gallery_ids;
    // galleries which are excluded from removal
    $saved_galleries = [
        "verify-demo-dev"
    ];
    $now = intval(round(microtime(true) * 1000));
    // set expiration time in ms
    $expiration = intval(1000*60*60*4); // expires in 4 hours
    foreach ($galleries as $gallery) {
        // see if timestamp is in gallery name
        $galleryTimeStamp = NULL;
        if(count(explode("-",$gallery)) > 1) {
             $galleryTimeStamp = explode("-",$gallery)[1];
        }
        if (!in_array($gallery, $saved_galleries) && is_numeric($galleryTimeStamp)) {
            if ($now > $galleryTimeStamp + $expiration) {
                $data = array("gallery_name" => $gallery);
                // remove galleries which have expired
                $request = curl_init(API_URL . "/gallery/remove");

                curl_setopt($request, CURLOPT_POST, true);
                curl_setopt($request, CURLOPT_HTTPHEADER, array(
                    "app_id:" . APP_ID, 
                    "app_key:" . APP_KEY
                    )
                );
                curl_setopt($request,CURLOPT_POSTFIELDS, json_encode($data));
                // output the response
                curl_setopt($request, CURLOPT_RETURNTRANSFER, true);

                $response = curl_exec($request);

                echo $response;
                // // close the session
                curl_close($request);
            }
        }
        else {
            echo "No galleries removed.";
        }
    };
}

?> 