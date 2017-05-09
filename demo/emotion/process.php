<?php

//------------------------------------
// process.php
// processes calls to Kairos API for webcam and URL modules
// and also for polling mediaId
// created: March 2016
// last modified August 2016
// author: Steve Rucker
//------------------------------------

set_time_limit(0);

$configs = include('../config.php');

if ($_POST['fname'] == "polling") {

    //------------------------------------
    // GET REQUEST TO API FOR POLLING FUNCTION
    //------------------------------------

    $mediaId = $_POST['mediaId'];

    $request = curl_init();
    // set curl options
    curl_setopt($request, CURLOPT_URL, API_URL . "/v2/media/" . $mediaId);
    curl_setopt($request, CURLOPT_HTTPHEADER, array(
            "app_id:" . APP_ID,
            "app_key:" . APP_KEY
        )
    );
    curl_setopt($request, CURLOPT_TIMEOUT, CURL_API_TIMEOUT);
    curl_setopt($request, CURLOPT_RETURNTRANSFER, true);

    $response = curl_exec($request);

    echo $response;
    // // close the session
    curl_close($request);

}
else if ($_POST['fname'] == "url") {

    //------------------------------------
    // POST REQUEST TO API WITH URL
    //------------------------------------

    // get URL from AJAX POST
    $thisUrl = $_POST["url"];

    $request = curl_init(API_URL . "/v2/media?source=" . $thisUrl . "&landmarks=1&timeout=1");

    // set curl options
    curl_setopt($request, CURLOPT_POST, true);
    curl_setopt($request, CURLOPT_HTTPHEADER, array(
        "app_id:" . APP_ID, 
        "app_key:" . APP_KEY
        )
    );
    curl_setopt($request, CURLOPT_TIMEOUT, CURL_API_TIMEOUT);
    curl_setopt($request, CURLOPT_RETURNTRANSFER, true);

    $response =  curl_exec($request);

    echo $response;

    curl_close($request);

}
else if ($_POST['fname'] == "analytics") {

    //------------------------------------
    // GET REQUEST TO API FOR ANALYTICS
    //------------------------------------

    $mediaId = $_POST['mediaId'];

    $request = curl_init();
    // set curl options
    curl_setopt($request, CURLOPT_URL, API_URL . "/v2/analytics/" . $mediaId);
    curl_setopt($request, CURLOPT_HTTPHEADER, array(
            "app_id:" . APP_ID,
            "app_key:" . APP_KEY
        )
    );
    curl_setopt($request, CURLOPT_TIMEOUT, CURL_API_TIMEOUT);
    curl_setopt($request, CURLOPT_RETURNTRANSFER, true);

    $response = curl_exec($request);

    echo $response;
    // // close the session
    curl_close($request);

}
else {

    //------------------------------------
    // POST REQUEST TO API FOR WEBCAM
    //------------------------------------
    
    // pull the raw binary data from the POST array
    $data = substr($_POST['data'], strpos($_POST['data'], ",") + 1);
    // decode it
    $decodedData = base64_decode($data);

    $filename = $_POST['fname'];
    $fullFilename = $filename . ".webm";
    file_put_contents("media/" . $fullFilename, $decodedData);

    // check if valid file (mime type and length)
    $validFile = true;
    if (file_mime_type("media/" . $fullFilename) != "application/octet-stream" &&
        file_mime_type("media/" . $fullFilename) != "video/x-matroska" &&
        file_mime_type("media/" . $fullFilename) != "video/webm") {
        $validFile = false;
    }
    if (filesize("media/" . $fullFilename) < 20000) {
        $validFile = false;
    }

    if ($validFile) {

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
              "source" => new CurlFile("media/" . $fullFilename),
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
    }

    else {
        $response = array (
            "Error" => "Invalid file"
        );
        print_r(json_encode($response));
    }

    unlink("media/" . $fullFilename);

}

function file_mime_type($file) {
    $mime = false;

    $file_info = new finfo(FILEINFO_MIME);
    $mime = $file_info->buffer(file_get_contents($file));

    return substr($mime, 0, strpos($mime, '; '));
}


?> 